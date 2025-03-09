// Credit for original: Astro team
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { transform } from '@sveltejs/site-kit/markdown';
import { generateText } from 'ai';
import dotenv from 'dotenv';
import fs, { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import glob from 'tiny-glob/sync.js';
import { fetch_details_for_package, request_queue, stream_search_by_keywords } from './npm.js';
import registry from '../../src/lib/registry.json' with { type: 'json' };

dotenv.config({ path: '.env.local' });

/**
 * Checks if a package is an official Svelte package
 */
function is_official(pkg: string): boolean {
	// TODO: Is the the only condition?
	return pkg.startsWith('@sveltejs/') || pkg === 'prettier-plugin-svelte';
}

/**
 * Sanitizes GitHub URLs to a standard format
 */
function sanitize_github_url(url: string): string {
	return url
		.replace('ssh://', '')
		.replace('git+', '')
		.replace('.git', '')
		.replace('git:', 'https:')
		.replace('git@github.com:', 'https://github.com/')
		.replace('git@github.com/', 'https://github.com/');
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

interface NormalizedPackageResult {
	name: string;
	title: string;
	description: string;
	categories: string[];
	npmUrl: string;
	repoUrl?: string;
	homepageUrl: string;
	official?: boolean;
}

/**
 * Normalizes package details from npm registry
 */
function normalize_package_details(
	data: NonNullable<Awaited<ReturnType<typeof fetch_details_for_package>>>,
	pkg: string
): NormalizedPackageResult {
	const keyword_categories = (data.keywords ?? []).flatMap(get_categories_for_keyword);

	if (keyword_categories.length === 0) {
		keyword_categories.push('uncategorized');
	}

	const official = is_official(pkg);

	const other_categories = [
		official ? 'official' : undefined,
		is_new_package(data) ? 'recent' : undefined
	].filter(Boolean);

	const uniq_categories = Array.from(new Set([...keyword_categories, ...other_categories]));

	const npm_url = `https://www.npmjs.com/package/${pkg}`;

	const repo_url = data.repository && sanitize_github_url(data.repository);

	let homepage_url = npm_url;
	// The `homepage` field is user-authored, so sometimes funky values can end up here.
	// This is just a brief sanity check that things looks vaguely like a URL.
	if (data.homepage?.toLowerCase().startsWith('https')) {
		homepage_url = data.homepage;
	}

	return {
		name: data.name,
		title: data.name,
		description: transform(data.description || ''),
		categories: uniq_categories.filter(Boolean) as string[],
		npmUrl: npm_url,
		repoUrl: repo_url,
		homepageUrl: homepage_url,
		official: official === true ? true : undefined
	};
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
	failed_packages?: Map<string, any> | null;
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
	const packages_map = new Map<string, any>();
	const failed_llm = new Map<string, any>();
	let batch_counter = 0;

	// Source of packages - either from search or from previous failed packages
	const package_source = failed_packages
		? create_map_batch_generator(failed_packages, batch_size)
		: stream_search_by_keywords({
				keywords,
				limit,
				fetch_package_json: true,
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
						package_details.llm_detail = json[pkg_name];

						// If LLM provided a new description, use it
						if (json[pkg_name].description) {
							package_details.package.description = json[pkg_name].description;
							console.log(`[${batch_id}] Updated description for ${pkg_name}`);
						}

						updated_count++;
						console.log(`[${batch_id}] Tagged ${pkg_name}: ${JSON.stringify(json[pkg_name].tags)}`);

						// Now that we have svelte_packages, write their data to .md files
						const cleaned_up_pkg_name = pkg_name.replace(/@/g, '').replace(/\//g, '-');

						let frontmatter = `---
name: "${pkg_name}"\n`;

						if (package_details.package.description) {
							frontmatter += `description: "${package_details.package.description}"\n`;
						}

						if (package_details.package.links.repository) {
							frontmatter += `repo_url: "${sanitize_github_url(package_details.package.links.repository)}"\n`;
						}

						if (package_details.package.publisher.username) {
							frontmatter += `author: "${package_details.package.publisher.username}"\n`;
						}

						if (package_details.package.links.homepage) {
							frontmatter += `homepage: "${package_details.package.links.homepage}"\n`;
						}

						if (package_details.downloads.weekly) {
							frontmatter += `downloads: ${package_details.downloads.weekly}\n`;
						}

						if (package_details.dependents) {
							frontmatter += `dependents: ${package_details.dependents}\n`;
						}
						if (package_details.updated) {
							frontmatter += `updated: "${package_details.last_published}"\n`;
						}

						frontmatter += `tags: 
${package_details.llm_detail.tags.map((tag = '') => `  - ${tag}`).join('\n')}\n`;

						frontmatter += '---\n';

						fs.writeFileSync(
							path.resolve(
								path.dirname(fileURLToPath(import.meta.url)),
								`../../src/lib/server/generated/registry/${cleaned_up_pkg_name}.md`
							),
							frontmatter
						);
					}
					// If not in json results, it's not a Svelte package - we don't add it to failed_llm
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
		const svelte_packages = new Map<string, any>();
		const non_svelte_packages = new Map<string, any>();

		for (const [pkg_name, pkg_data] of packages_map) {
			console.log(pkg_data.llm_detail);
			if (pkg_data.llm_detail && (pkg_data.llm_detail?.tags?.length ?? 0) > 0) {
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
 * Creates a generator that yields batches from a Map
 */
async function* create_map_batch_generator(
	source_map: Map<string, any>,
	batch_size: number
): AsyncGenerator<Map<string, any>> {
	// Convert map to array for easier batching
	const entries = Array.from(source_map.entries());

	for (let i = 0; i < entries.length; i += batch_size) {
		const batch_entries = entries.slice(i, i + batch_size);
		yield new Map(batch_entries);
	}
}

const svelte_packages = await process_batches_through_llm();
