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
import registry from './registry.json' with { type: 'json' };

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
		.replace('git+', '')
		.replace('.git', '')
		.replace('git:', 'https:')
		.replace('git@github.com:', 'https://github.com/');
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

const keyword_to_categories = Object.entries(registry.categories).reduce((acc, [key, value]) => {
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

const TAGS_PROMPT: Record<string, string> = {
	// Component and UI categories
	'component-library':
		'ANY collection of Svelte components (2 or more). UI kits, design systems, widget collections, form components.',

	ui: 'ANY UI-related code for Svelte. Single components, styling utilities, animations, transitions, visual elements, modals, tooltips.',

	// Utility categories
	utility:
		'ANY helper functionality for Svelte. Stores, actions, directives, hooks, form handling, data fetching, validation, i18n.',

	// Feature-specific categories
	router:
		'ANY routing or navigation related code. Page transitions, route management, URL handling, history management.',

	content:
		'ANY content or data handling. Markdown, MDX, CMS integration, blogs, static site generation, content editing.',

	media:
		'ANY media-related features. Images, videos, audio, file uploads, media players, carousels, galleries.',

	// Infrastructure categories
	server:
		'ANY server-related functionality. SSR, API integration, data fetching, backend communication, cookies, sessions.',

	adapter:
		'ANY SvelteKit deployment solutions. Hosting integrations, platform adapters, deployment utilities.',

	tooling:
		'ANY development tools. Build plugins, code generation, testing, debugging, development workflows, CLI tools.',

	preprocessor:
		'ANY compile-time functionality. Language integration (SCSS/TS), template processing, code transformation.',

	// Specialized functionality
	performance:
		'ANY performance optimization. Bundle optimization, runtime improvements, rendering optimization, lazy loading.',

	seo: 'ANY SEO-related features. Meta tags, structured data, sitemaps, SEO analysis, head management.',

	dom: 'ANY direct DOM interaction. Portal components, element queries, viewport detection, scroll handling, focus management.',

	auth: 'ANY authentication or authorization. Login systems, OAuth, JWT, permission management, user sessions.',

	// Specialized integration
	integration:
		'ANY integration with external services or libraries. Database connectors, API clients, third-party service integration.',

	testing:
		'Testing utilities, frameworks, or helpers specifically for Svelte applications. Includes test runners, mocking tools, assertion libraries, UI testing, and component testing for Svelte.'
};

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
	limit = 500,
	batch_size = 20,
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
				You are a strict Svelte package validator with an absolute focus on Svelte exclusivity.

MISSION:
Identify ONLY packages designed PRIMARILY and EXCLUSIVELY for Svelte. The package must be BUILT FOR SVELTE AS ITS MAIN TARGET.

MANDATORY REJECTION CRITERIA - REJECT ANY package that meets ANY of these:
- Package primarily supports React/Vue/Angular with Svelte as a secondary adapter
- Package documentation primarily shows examples for other frameworks
- Package is marketed as "framework agnostic" or "works with any framework"
- Package is a general utility that isn't specifically designed for Svelte
- Package repository has more React/Vue/etc. code than Svelte code
- Package that serves as a bridge/adapter between Svelte and another framework

MANDATORY ACCEPTANCE CRITERIA - Package MUST meet ALL of these:
1. Package MUST be designed primarily for Svelte developers
2. Package MUST contain actual Svelte-specific code
3. Svelte MUST be the main framework it targets, not just one of many supported frameworks

EVIDENCE TO LOOK FOR:
- Package documentation focuses primarily on Svelte usage
- Code contains Svelte-specific patterns like '<script>', '$:', 'export let', '.svelte'
- Package directly imports the 'svelte' library
- Package has 'svelte' or '@sveltejs/*' in dependencies
- Svelte is treated as the main framework, not just an alternative

DO NOT TAG libraries that merely support Svelte as one of many frameworks. These packages MUST be Svelte-first.

RETURN AN EMPTY OBJECT {} IF NO PACKAGES PASS YOUR VALIDATION.`,
					system: `SVELTE-ONLY VALIDATION SYSTEM

YOU ARE IN STRICT FRAMEWORK EXCLUSIVITY MODE.

The Svelte ecosystem documentation should ONLY include packages that were BUILT SPECIFICALLY FOR SVELTE.

AUTOMATIC REJECTION RULES:
- If the package equally supports multiple frameworks (React, Vue, etc.) - REJECT
- If the package mentions "adapter for Svelte" or "Svelte integration" - REJECT
- If the package is primarily for another framework with Svelte support added - REJECT
- If the package is completely framework-agnostic with no Svelte-specific implementation - REJECT

EXAMPLES OF PACKAGES TO REJECT:
- A UI library that has versions for React, Vue, AND Svelte, but the npm package input is NOT SVELTE
- A utility that works with any framework and mentions Svelte compatibility
- General JavaScript utilities that happen to work with Svelte

EXAMPLES OF PACKAGES TO ACCEPT:
- Svelte component libraries built specifically for Svelte
- SvelteKit plugins and extensions
- Svelte actions and stores
- Development tools specifically for Svelte projects

RESPONSE FORMAT:
{
  "legitimate-svelte-package": {
    "tags": ["tag1", "tag2"]
  }
}

AVAILABLE TAGS:
${JSON.stringify(TAGS_PROMPT)}

${JSON.stringify(batch_data)}
						`,
					maxRetries: 2,
					temperature: is_retry ? 0.1 : 0.3 // Slightly higher temperature for initial runs
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

				// Update packages in the map with LLM results
				let updated_count = 0;

				for (const [pkg_name, pkg_data] of packages) {
					if (json[pkg_name]) {
						// Package was successfully analyzed as a Svelte package
						const package_details = packages_map.get(pkg_name);
						package_details.llm_detail = json[pkg_name];
						updated_count++;
						console.log(`[${batch_id}] Tagged ${pkg_name}: ${JSON.stringify(json[pkg_name].tags)}`);
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

for (const [pkg_name, pkg_data] of svelte_packages) {
	// Now that we have svelte_packages, write their data to .md files
	const cleaned_up_pkg_name = pkg_name.replace(/@/g, '').replace(/\//g, '-');

	let frontmatter = `---
name: "${pkg_name}"\n`;

	if (pkg_data.package.description) {
		frontmatter += `description: "${pkg_data.package.description}"\n`;
	}

	if (pkg_data.package.links.repository) {
		frontmatter += `repo_url: "${sanitize_github_url(pkg_data.package.links.repository)}"\n`;
	}

	if (pkg_data.package.publisher.username) {
		frontmatter += `author: "${pkg_data.package.publisher.username}"\n`;
	}

	if (pkg_data.package.links.homepage) {
		frontmatter += `homepage: "${pkg_data.package.links.homepage}"\n`;
	}

	if (pkg_data.downloads.weekly) {
		frontmatter += `downloads: ${pkg_data.downloads.weekly}\n`;
	}

	if (pkg_data.dependents) {
		frontmatter += `dependents: ${pkg_data.dependents}\n`;
	}

	if (pkg_data.updated) {
		frontmatter += `updated: "${pkg_data.updated}"\n`;
	}

	frontmatter += `tags: 
${pkg_data.llm_detail.tags.map((tag = '') => `  - ${tag}`).join('\n')}\n`;

	frontmatter += '---\n';

	fs.writeFileSync(
		path.resolve(
			path.dirname(fileURLToPath(import.meta.url)),
			`../../src/lib/server/generated/registry/${cleaned_up_pkg_name}.md`
		),
		frontmatter
	);
}
