// Credit for original: Astro team
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { extract_frontmatter, transform } from '@sveltejs/site-kit/markdown';
import { generateText } from 'ai';
import dotenv from 'dotenv';
import fs, { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import glob from 'tiny-glob/sync.js';
import registry from '../../src/lib/registry.json' with { type: 'json' };
import type { Package } from '../../src/lib/server/content.js';
import {
	fetch_details_for_package,
	HEADERS,
	PackageCache,
	request_queue,
	sanitize_github_url,
	stream_search_by_keywords,
	structure_package_to_package,
	superfetch,
	type StructuredInterimPackage
} from './npm.js';

dotenv.config({ path: '.env.local' });

/**
 * Checks if a package is an official Svelte package
 */
function is_official(pkg: string): boolean {
	// TODO: Is the the only condition?
	return pkg.startsWith('@sveltejs/') || pkg === 'prettier-plugin-svelte';
}

const NEW_THRESHOLD_DAYS = 28;

interface PackageWithTime {
	time?: {
		created: string;
	};
}

/**
 * Checks if a package was published recently
 */
function is_new_package(pkg: PackageWithTime): boolean {
	if (!pkg.time?.created) return false;

	const date = new Date(pkg.time.created);
	const now = new Date();

	return +now - +date > NEW_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;
}

const keyword_to_categories = Object.entries(registry.tags).reduce((acc, [key, value]) => {
	const { keywords = [] } = value as { keywords?: string[] };

	for (const keyword of keywords) {
		const set = acc.get(keyword) || new Set();
		set.add(key);
		acc.set(keyword, set);
	}

	return acc;
}, new Map<string, Set<string>>());

/**
 * Gets a list of integration categories for an npm keyword.
 */
function get_categories_for_keyword(keyword: string): string[] {
	return [...(keyword_to_categories.get(keyword) || [])];
}

function update_last_modified(): void {
	mkdirSync(
		path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../src/lib/server/generated'),
		{ recursive: true }
	);

	const pathname = path.resolve(
		path.dirname(fileURLToPath(import.meta.url)),
		'../../src/lib/server/generated/last-modified.json'
	);

	let json: string;

	try {
		json = fs.readFileSync(pathname, { encoding: 'utf8' });
	} catch {
		// Try making it
		json = JSON.stringify({});
		fs.writeFileSync(pathname, json, { encoding: 'utf8' });
	}

	const data = JSON.parse(json);
	data.registry = new Date().toUTCString();
	fs.writeFileSync(pathname, JSON.stringify(data, null, '\t'), { encoding: 'utf8' });
}

async function get_integration_files(): Promise<string[]> {
	return glob('src/lib/server/generated/registry/*.md', {
		cwd: path.resolve(fileURLToPath(import.meta.url), '../../..')
	});
}

const openrouter = createOpenRouter({
	apiKey: process.env.OPENROUTER_API_KEY
});

const TAGS_PROMPT: Record<string, string> = Object.entries(registry.tags).reduce(
	(acc, [key, value]) => {
		acc[key] = value.prompt;
		return acc;
	},
	{} as Record<string, string>
);

interface ProcessBatchesOptions {
	/** Keywords to search for (default: ['svelte']) */
	keywords?: string[];

	/** Max packages to process (default: 200) */
	limit?: number;

	/** Packages per batch (default: 20) */
	batch_size?: number;

	/** Maximum retry attempts (default: 5) */
	max_retries?: number;

	/** Current retry count (used internally) */
	retry_count?: number;

	/** Failed packages from previous run (used internally) */
	failed_packages?: Map<string, StructuredInterimPackage> | null;
}

/**
 * Process packages through LLM with recursive retries for failed packages
 */
async function process_batches_through_llm({
	keywords = ['svelte'],
	limit = Infinity,
	batch_size = 25,
	max_retries = 2,
	retry_count = 0,
	failed_packages = null
}: ProcessBatchesOptions = {}): Promise<Map<string, any>> {
	const packages_map = new Map<string, StructuredInterimPackage>();
	const failed_llm = new Map<string, StructuredInterimPackage>();
	let batch_counter = 0;

	// Source of packages - either from search or from previous failed packages
	const package_source = failed_packages
		? create_map_batch_generator(failed_packages, batch_size)
		: stream_search_by_keywords({
				keywords,
				limit,
				fetch: { package_json: true, github_stars: true },
				batch_size,
				skip_cached: true
			});

	// Whether this is a retry run
	const is_retry = retry_count > 0;
	console.log(`${is_retry ? `Retry attempt ${retry_count}` : 'Initial processing'} started`);

	// Process each batch from the source
	for await (const packages of package_source) {
		batch_counter++;
		const batch_id = is_retry
			? `retry${retry_count}-batch-${batch_counter}`
			: `batch-${batch_counter}`;
		console.log(`Processing ${batch_id} with ${packages.size} packages`);

		// Add all packages to the map immediately to preserve order
		for (const [pkg_name, pkg_data] of packages) {
			packages_map.set(pkg_name, pkg_data);
		}

		// Process this batch with LLM
		request_queue.enqueue(async () => {
			try {
				console.time(`llm-${batch_id}`);
				const batch_data = Object.fromEntries(packages);

				const { text } = await generateText({
					model: openrouter('google/gemini-2.0-flash-lite-001'),
					prompt: `
				INSTRUCTIONS:
				Apply this filtering to packages and return ONLY a valid JSON object.
				
				1. EXCLUDE any package where:
					 - Name contains "react", "vue", "angular", "solid" (unless it also has "svelte" in the name)
					 - Missing 'svelte' in dependencies or peerDependencies
					 - README doesn't contain at least one \`\`\`svelte code block
				
				2. ALWAYS EXCLUDE these packages, NO EXCEPTIONS:
					 - "embla-carousel-react"
					 - Any package with "carousel" AND "react" in the name
					 - Any package with "react-" prefix
					 - Any package with "-react" suffix
				
				3. For INCLUDED packages:
					 - Assign relevant tags
					 - Clean up description
				
				OUTPUT FORMAT:
				Return ONLY a valid JSON object like this:
				{
					"package-name-1": {
						"tags": ["tag1", "tag2"],
						"description": "Description"
					},
					"package-name-2": {
						"tags": ["tag1", "tag3"],
						"description": "Description"
					}
				}
				
				CRITICAL: 
				- DO NOT include JavaScript code, variable assignments, or console.log
				- DO NOT use \`\`\`json code blocks
				- Return an empty object {} if no packages qualify
				- YOUR RESPONSE MUST BE VALID JSON AND NOTHING ELSE`,
					system: `STRICT OUTPUT REQUIREMENTS
				
				You MUST return ONLY a valid JSON object and nothing else:
				- No explanations
				- No code blocks
				- No variable assignments
				- No JavaScript syntax
				- No console.log statements
				- No comments
				
				Just a plain JSON object like:
				{
					"package-name": {
						"tags": ["tag1", "tag2"],
						"description": "Clean description"
					}
				}
				
				Or an empty object {} if no packages qualify.
				
				FILTERING LOGIC:
				1. Exclude packages with other framework names (unless they also have "svelte")
				2. Exclude packages without 'svelte' in dependencies/peerDependencies
				3. Exclude packages without \`\`\`svelte code examples in README
				4. ALWAYS exclude "embla-carousel-react" and similar packages
				
				AVAILABLE TAGS:
				${JSON.stringify(TAGS_PROMPT)}
				
				${JSON.stringify(batch_data)}`,
					maxRetries: 3,
					temperature: 0.0 // Absolutely no deviation
				});
				console.timeEnd(`llm-${batch_id}`);

				// Parse the LLM response
				let json;
				try {
					json = JSON.parse(text);
				} catch (e) {
					const sanitized_text = text.replace(/```json\s*\n([\s\S]*?)\n\s*```/, '$1');
					try {
						json = JSON.parse(sanitized_text);
					} catch (inner_error) {
						console.error(`Failed to parse JSON for ${batch_id}:`, inner_error);
						console.log('Raw response:', text);

						// Only add to failed_llm if parsing failed
						for (const [pkg_name, pkg_data] of packages.entries()) {
							failed_llm.set(pkg_name, pkg_data);
						}
						return;
					}
				}

				console.log(json);

				// Update packages in the map with LLM results
				let updated_count = 0;

				for (const [pkg_name] of packages) {
					if (json[pkg_name]) {
						// Package was successfully analyzed as a Svelte package
						const package_details = packages_map.get(pkg_name);

						if (!package_details) continue;

						package_details.meta.tags = json[pkg_name].tags ?? [];

						if (package_details.meta.tags.length === 0) continue;

						// If LLM provided a new description, use it
						if (json[pkg_name].description) {
							package_details.meta.description = json[pkg_name].description;
							console.log(`[${batch_id}] Updated description for ${pkg_name}`);
						}

						updated_count++;
						console.log(`[${batch_id}] Tagged ${pkg_name}: ${JSON.stringify(json[pkg_name].tags)}`);

						PackageCache.set(pkg_name, structure_package_to_package(package_details));
					}
				}

				console.log(
					`[${batch_id}] Successfully tagged ${updated_count}/${packages.size} packages as Svelte packages`
				);
			} catch (error) {
				console.error(`Error processing ${batch_id}:`, error);
				// Only add packages to failed_llm if there was an error in processing
				for (const [pkg_name, pkg_data] of packages.entries()) {
					failed_llm.set(pkg_name, pkg_data);
				}
			}
		});
	}

	// Wait for all queued operations to complete
	console.log('Waiting for all request queue operations to complete...');
	while (request_queue.running > 0 || request_queue.queue.length > 0) {
		await new Promise((resolve) => setTimeout(resolve, 1000));
	}
	console.log('All request queue operations completed');

	// If we have failed packages and haven't reached max retries, recursively retry them
	if (failed_llm.size > 0 && retry_count < max_retries) {
		console.log(
			`${failed_llm.size} packages failed processing, starting retry #${retry_count + 1}`
		);

		// Recursively call this function with the failed packages
		const retry_results = await process_batches_through_llm({
			keywords,
			limit,
			batch_size,
			max_retries,
			retry_count: retry_count + 1,
			failed_packages: failed_llm
		});

		// Merge the retry results into our main map
		for (const [pkg_name, pkg_data] of retry_results) {
			packages_map.set(pkg_name, pkg_data);
		}
	} else if (failed_llm.size > 0) {
		console.log(`${failed_llm.size} packages still failed after ${max_retries} retry attempts`);
	}

	// If this is the top-level call (not a retry), filter and return only Svelte packages
	if (retry_count === 0) {
		// Filter out packages that didn't get LLM details (non-Svelte packages)
		const svelte_packages = new Map<string, StructuredInterimPackage>();
		const non_svelte_packages = new Map<string, StructuredInterimPackage>();

		for (const [pkg_name, pkg_data] of packages_map) {
			console.log(pkg_data.meta.tags, pkg_data.meta.description);
			if (pkg_data.meta.tags.length > 0) {
				svelte_packages.set(pkg_name, pkg_data);
			} else {
				non_svelte_packages.set(pkg_name, pkg_data);
			}
		}

		console.log(
			`Final results: ${svelte_packages.size} Svelte packages, ${non_svelte_packages.size} non-Svelte packages`
		);

		return svelte_packages;
	}

	// For retry calls, return the full map for merging
	return packages_map;
}

/**
 * Fetches the number of stars for a GitHub repository
 */
export async function fetch_github_stars(repo_url: string): Promise<number | null> {
	// Validate and normalize the GitHub URL
	if (!repo_url) {
		console.error('No repository URL provided');
		return null;
	}

	// Ensure URL is sanitized and in the correct format
	const sanitized_url = sanitize_github_url(repo_url);

	// Extract owner and repo name from the GitHub URL
	// Example: https://github.com/owner/repo
	const url_parts = new URL(sanitized_url);
	const path_parts = url_parts.pathname.split('/').filter(Boolean);

	if (path_parts.length < 2) {
		console.error(`Invalid GitHub repository URL: ${repo_url}`);
		return null;
	}

	const [owner, repo] = path_parts;

	// GitHub API URL to fetch repository data
	let api_url = `https://api.github.com/repos/${owner}/${repo}`;

	try {
		console.log(`Fetching stars for ${owner}/${repo}`);
		const response = await superfetch(api_url, {
			headers: {
				...HEADERS,
				Accept: 'application/vnd.github.v3+json',
				Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
			}
		});

		if (response.status === 404) {
			console.log(`404 Not Found for ${api_url} (Not retrying)`);
			return null;
		}

		const data = await response.json();

		if (!data || typeof data.stargazers_count !== 'number') {
			console.error(`Invalid response from GitHub API for ${repo_url}`);
			return null;
		}

		return data.stargazers_count;
	} catch (error) {
		console.error(`Error fetching stars for ${repo_url}:`, error);
		return null;
	}
}

async function update_all_github_stars(ignore_if_exists = false) {
	for await (const [pkg, data] of PackageCache.entries()) {
		if (data.repo_url && !(ignore_if_exists && data.github_stars)) {
			try {
				// Fetch stars of this repo
				const stars = await fetch_github_stars(data.repo_url);

				if (typeof stars === 'number') {
					data.github_stars = stars;

					PackageCache.set(pkg, data);
				}
			} catch (e) {
				console.error(e, data);
			}
		}
	}
}

// Gets the cached files, goes through npm for each, and udpate
// all relevant npm information from that
async function update_cache_from_npm() {
	// for (const [pkg_file_name, data] of PackageCache.entries()) {
	// console.log(await fetch_details_for_package(data.name));
	// }
	const detail = await fetch_details_for_package('svelte-drag');

	const latestVersion = detail['dist-tags']?.latest;

	console.log(detail.versions[latestVersion]);
}

async function delete_untagged() {
	for await (const [pkg_name_file, data] of PackageCache.entries()) {
		if (!Array.isArray(data.tags)) {
			PackageCache.delete(data.name);
		}
	}
}

/**
 * Creates a generator that yields batches from a Map
 */
async function* create_map_batch_generator(
	source_map: Map<string, StructuredInterimPackage>,
	batch_size: number
): AsyncGenerator<Map<string, StructuredInterimPackage>> {
	// Convert map to array for easier batching
	const entries = Array.from(source_map.entries());

	for (let i = 0; i < entries.length; i += batch_size) {
		const batch_entries = entries.slice(i, i + batch_size);
		yield new Map(batch_entries);
	}
}

// const svelte_packages = await process_batches_through_llm();

// update_cache_from_npm();
update_all_github_stars();
// delete_untagged();
