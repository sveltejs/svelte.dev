import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';
import dotenv from 'dotenv';
import fs, { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PACKAGES_META } from '../../src/lib/packages-meta.js';
import type { Package } from '../../src/lib/server/content.js';
import svelte_society_list from '../../src/lib/society-npm.json' with { type: 'json' };
import { sort_packages } from '../../src/routes/(packages)/packages/packages-search.js';
import {
	check_typescript_types,
	fetch_details_for_package,
	fetch_downloads_for_package,
	HEADERS,
	PackageCache,
	REGISTRY_BASE_URL,
	request_queue,
	sanitize_github_url,
	stream_packages_by_names,
	stream_search_by_keywords,
	structured_interim_package_to_package,
	superfetch,
	supports_svelte_versions,
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

const keyword_to_categories = Object.entries(PACKAGES_META.TAGS).reduce((acc, [key, value]) => {
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

const openrouter = createOpenRouter({
	apiKey: process.env.OPENROUTER_API_KEY
});

const TAGS_PROMPT: Record<string, string> = Object.entries(PACKAGES_META.TAGS).reduce(
	(acc, [key, value]) => {
		acc[key] = value.prompt;
		return acc;
	},
	{} as Record<string, string>
);

/**
 * Core LLM processing logic for batches of packages
 * This function handles all the details of processing packages through LLM,
 * including batching, retries, and error handling
 */
async function process_batches_through_llm_base({
	package_source,
	limit = Infinity,
	batch_size = 20,
	max_retries = 2,
	retry_count = 0,
	failed_packages = null,
	force_include_all_packages = false
}: {
	package_source: AsyncGenerator<Map<string, StructuredInterimPackage>>;
	limit?: number;
	batch_size?: number;
	max_retries?: number;
	retry_count?: number;
	failed_packages?: Map<string, StructuredInterimPackage> | null;
	force_include_all_packages?: boolean;
}): Promise<Map<string, StructuredInterimPackage>> {
	const packages_map = new Map<string, StructuredInterimPackage>();
	const failed_llm = new Map<string, StructuredInterimPackage>();
	let batch_counter = 0;

	// Source of packages - either from the provided source or from failed packages in retry runs
	const actual_package_source = failed_packages
		? create_map_batch_generator(failed_packages, batch_size)
		: package_source;

	// Whether this is a retry run
	const is_retry = retry_count > 0;
	console.log(`${is_retry ? `Retry attempt ${retry_count}` : 'Initial processing'} started`);

	// Process each batch from the source
	for await (const packages of actual_package_source) {
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

				console.log({ force_include_all_packages });
				const { text } = await generateText({
					model: openrouter('google/gemini-2.0-flash-lite-001'),
					prompt: `
				INSTRUCTIONS:
				${
					!force_include_all_packages
						? `
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
				`
						: `
				Process ALL packages in the input and return a valid JSON object.
				`
				}
				
				${
					force_include_all_packages
						? `
				For EVERY package:
				`
						: `
				For INCLUDED packages:
				`
				}
				 - Assign relevant tags based on functionality (at least one tag is MANDATORY)
				 - ALWAYS provide a terse description:
					 - Must be plain text (no markdown, HTML, or special chars)
					 - Should be 30-80 characters, direct and to the point
					 - Use simple present tense verbs
					 - No need for complete sentences; can omit articles
				
				OUTPUT FORMAT:
				Return ONLY a valid JSON object like this:
				{
					"package-name-1": {
						"tags": ["tag1", "tag2"],
						"description": "Parse Svelte markup without parsing script or style tags, useful for codemods and tooling.",
						"runes": true,
					},
					"package-name-2": {
						"tags": ["tag1", "tag3"],
						"description": "Accessible UI components for Svelte applications.",
						"runes": false,
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
						"description": "Terse description",
						"runes": true
					}
				}
				
				Or an empty object {} if no packages qualify.
				
				${
					!force_include_all_packages
						? `
				FILTERING LOGIC:
				1. Exclude packages with other framework names (unless they also have "svelte")
				2. Exclude packages without 'svelte' in dependencies/peerDependencies
				3. Exclude packages without \`\`\`svelte code examples in README
				4. ALWAYS exclude "embla-carousel-react" and similar packages
				`
						: `
				IMPORTANT:
				Process ALL packages, without applying filtering criteria. Assign at least one tag to EVERY package.
				`
				}
				
				DESCRIPTION REQUIREMENTS:
				For ${force_include_all_packages ? 'ALL' : 'qualifying'} packages:
				1. Create terse, direct descriptions (30-80 characters)
				2. Start with a verb in present tense (Parse, Create, Generate, etc.)
				3. Focus only on core functionality, omit fluff
				4. Articles (a, an, the) can be omitted
				5. Use plain text only - no markdown, HTML, or special characters
				6. Prioritize brevity over completeness
				
				TAG REQUIREMENTS:
				For ${force_include_all_packages ? 'ALL' : 'qualifying'} packages:
				1. Every package MUST have at least one tag assigned
				2. Choose the most relevant tags based on package functionality
				
				EXAMPLE FORMATS:
				- "Parse Svelte markup without parsing script tags, useful for codemods."
				- "Generate type definitions for Svelte components."
				- "Build forms with validation in Svelte apps."
				- "Convert Markdown to Svelte components."
				
				SVELTE 5 RUNES DETECTION:
				For each package, thoroughly analyze code examples to determine if they use Svelte 5 runes and include a "runes" boolean field:
				
				1. Set "runes": true if ANY of these patterns appear in code examples:
					
					STATE MANAGEMENT:
					- $state(...) - Reactive state declaration
					- $state.raw(...) - Raw state without deep reactivity
					- $state.snapshot(...) - Taking static snapshots of state
					- $derived(...) - Derived reactive values
					- $derived.by(() => {...}) - Complex derived calculations
					
					LIFECYCLE & EFFECTS:
					- $effect(() => {...}) - Side effects when dependencies change
					- $effect.pre(() => {...}) - Effects that run before DOM updates
					- $effect.root(() => {...}) - Non-tracked effect scope
					- $effect.tracking() - Detect if running in tracking context
					
					COMPONENT API:
					- $props() - Component props declaration
					- let { ...props } = $props() - Props destructuring
					- $props.id() - Generate unique component instance ID
					- $bindable(...) - Mark props as bindable by parent
					- $host() - Access to custom element host
					
					DEBUGGING & UTILITIES:
					- $inspect(...) - Debug reactive values
					- $inspect.trace(...) - Trace function execution
					- $inspect(...).with(...) - Custom inspect handling
					- untrack(...) - Prevent tracking inside reactive context
					
					TEMPLATING FEATURES:
					- {#snippet ...}{/snippet} - Snippet blocks (replaces slots)
					- {@render ...} - Render tags for snippets
					- createRawSnippet(...) - Programmatic snippet creation
					
					EVENT HANDLING:
					- onclick={...}, onkeydown={...} etc. - Modern event attributes (not on:click)
					- {...props} - Props spreading including event handlers
					
					REACTIVE VALUE PATTERNS:
					- someValue.current - .current property access (except $store.current)
					- MediaQuery/ReactiveValue usage from svelte/reactivity
					- SvelteMap, SvelteSet, SvelteURL from svelte/reactivity
					
					IMPORTS & MODULE STRUCTURE:
					- import {...} from 'svelte/reactivity' - Reactive utilities
					- import { mount, hydrate } from 'svelte' - Component lifecycle
					- .svelte.js or .svelte.ts file extensions mentioned
					
				2. Set "runes": false if:
					- Only legacy Svelte 4 patterns are detected:
						- export let prop - Legacy props
						- $: derived = ... - Legacy reactive declarations
						- <slot> elements - Legacy content passing
						- on:event handlers - Legacy event handling
						- $$props, $$restProps - Legacy prop access
						- createEventDispatcher - Legacy events
					
				3. Consider package metadata:
					- If package specifically mentions "Svelte 5" or "runes" support in description
					- If package.json shows a dependency on "svelte": "^5" or similar
				
				4. When in doubt, set "runes": false - be conservative with detection
				
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
					// Package was successfully analyzed as a Svelte package
					const package_details = packages_map.get(pkg_name);
					if (!package_details) continue;

					if (json[pkg_name]) {
						package_details.meta.tags = json[pkg_name].tags ?? [];

						if (package_details.meta.tags.length === 0) continue;

						// If LLM provided a new description, use it
						if (json[pkg_name].description) {
							package_details.meta.description = json[pkg_name].description;
							console.log(`[${batch_id}] Updated description for ${pkg_name}`);
						}

						if (json[pkg_name].runes && package_details.meta.svelte[5]) {
							package_details.meta.runes = json[pkg_name].runes;
							console.log(`[${batch_id}] Updated runes for ${pkg_name}`);
						}

						updated_count++;
						console.log(`[${batch_id}] Tagged ${pkg_name}: ${JSON.stringify(json[pkg_name].tags)}`);

						PackageCache.set(pkg_name, structured_interim_package_to_package(package_details));
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
		const retry_results = await process_batches_through_llm_base({
			package_source, // Original package source is passed, but won't be used for retries
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
 * Process packages through LLM using keyword search
 */
async function process_batches_through_llm({
	keywords = ['svelte'],
	limit = 6000,
	batch_size = 20,
	max_retries = 2
}: {
	keywords?: string[];
	limit?: number;
	batch_size?: number;
	max_retries?: number;
} = {}): Promise<Map<string, StructuredInterimPackage>> {
	// Source of packages from keyword search
	const package_source = stream_search_by_keywords({
		keywords,
		limit,
		batch_size,
		skip_cached: true
	});

	// Use the base processing function with the appropriate package source
	return process_batches_through_llm_base({
		package_source,
		limit,
		batch_size,
		max_retries
	});
}

/**
 * Process specific packages through LLM by name
 */
async function process_packages_by_names_through_llm({
	package_names = [],
	limit = Infinity,
	batch_size = 20,
	max_retries = 2,
	force_include_all_packages = false
}: {
	package_names?: string[];
	limit?: number;
	batch_size?: number;
	max_retries?: number;
	force_include_all_packages?: boolean;
} = {}): Promise<Map<string, StructuredInterimPackage>> {
	// Source of packages from specific package names
	const package_source = stream_packages_by_names({
		package_names,
		limit,
		batch_size,
		skip_cached: true
	});

	// Use the base processing function with the appropriate package source
	return process_batches_through_llm_base({
		package_source,
		limit,
		batch_size,
		max_retries,
		force_include_all_packages
	});
}

/**
 * Fetches the number of stars for a GitHub repository
 */
export async function fetch_github_data(
	repo_url: string
): Promise<{ stars: number; homepage: string } | null> {
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

		return {
			stars: data.stargazers_count,
			homepage: data.homepage
		};
	} catch (error) {
		console.error(`Error fetching stars for ${repo_url}:`, error);
		return null;
	}
}

async function update_all_github_data(ignore_if_exists = false) {
	for await (const [pkg, data] of PackageCache.entries()) {
		if (data.repo_url && !(ignore_if_exists && data.github_stars)) {
			try {
				// Fetch stars of this repo
				const gh_data = await fetch_github_data(data.repo_url);

				if (gh_data != null) {
					data.github_stars = gh_data.stars;
					if (!data.homepage) data.homepage = gh_data.homepage;

					console.log({ pkg });
					PackageCache.set(pkg, data);
				}
			} catch (e) {
				console.error(e, data);
			}
		}
	}
}

async function remove_forks() {
	const repo_url_to_interim_package = new Map<string, Set<Package>>();

	for await (const [pkg, data] of PackageCache.entries()) {
		if (data.repo_url) {
			if (!repo_url_to_interim_package.has(data.repo_url)) {
				repo_url_to_interim_package.set(data.repo_url, new Set());
			}

			repo_url_to_interim_package.get(data.repo_url)!.add(data);
		}
	}

	const to_delete_packages = new Set<string>();
	for (const set of repo_url_to_interim_package.values()) {
		// find the most popular package
		const max = Array.from(set).sort((a, b) => sort_packages(a, b, 'popularity'))[0];

		// Now, delete entries from set where not even one author is in the max package
		for (const pkg of set) {
			if (pkg.name === max.name) continue;

			to_delete_packages.add(pkg.name);
			for (const author of pkg.authors ?? []) {
				if (max.authors?.includes(author)) {
					to_delete_packages.delete(pkg.name);
				}
			}
		}
	}

	for (const pkg of to_delete_packages) {
		console.log('DELETING', pkg);
		PackageCache.delete(pkg);
	}
}

async function update_overrides() {
	const overrides = PACKAGES_META.OVERRIDES;

	const to_force_include = new Set<string>();
	const to_remove = new Set<string>();
	const to_force_include_and_alter = new Map<string, Partial<Package>>();

	for (const [pkg, value] of overrides) {
		if (pkg instanceof RegExp) {
			// TODO: Not supported yet
			continue;
		}
		if (value === true) to_force_include.add(pkg);
		else if (value === false) to_remove.add(pkg);
		else if (typeof value === 'object') {
			to_force_include_and_alter.set(pkg, value);
		}
	}

	// First delete the packages to_remove
	for (const pkg of to_remove) {
		await PackageCache.delete(pkg);
	}

	// Now run the preprocess on the list of packages to_force_include_and_alter
	const combined_to_crawl = new Set([...to_force_include_and_alter.keys(), ...to_force_include]);

	await process_packages_by_names_through_llm({
		package_names: Array.from(combined_to_crawl),
		limit: Infinity,
		batch_size: 20,
		max_retries: 2,
		force_include_all_packages: true
	});

	// Now go through the to_force_include_and_alter, and merge the existing package data with the one in the override
	for (const [pkg, override] of to_force_include_and_alter) {
		const existing_package = await PackageCache.get(pkg);

		if (!existing_package) {
			console.warn(`No existing package found for ${pkg}, skipping override`);
			continue;
		}

		// Merge the existing package data with the override
		const merged_package = {
			...existing_package,
			...override
		};

		await PackageCache.set(pkg, merged_package);
	}
}

/**
 * Updates package cache with latest npm data
 * Uses existing request_queue from superfetch for concurrency control
 */
async function update_cache_from_npm() {
	// Track progress
	let processedCount = 0;
	const updatedPackages: {
		pkg_name: string;
		data: Package;
	}[] = [];

	// Collect all package entries to count total
	const packages = [];
	for await (const [pkg_name, data] of PackageCache.entries()) {
		packages.push({ pkg_name, data });
	}

	const totalPackages = packages.length;
	console.log(`Starting update for ${totalPackages} packages`);

	// Create array of promises for package updates
	const promises = packages.map(({ pkg_name, data }) => {
		// These fetch functions already use request_queue internally via superfetch
		return Promise.all([
			fetch_details_for_package(data.name),
			fetch_downloads_for_package(data.name)
		])
			.then(([details, downloads]) => {
				try {
					if (!details) {
						console.warn(`No details found for package: ${data.name}`);
						return null;
					}

					const latest_version = details['dist-tags']?.latest;
					if (!latest_version) {
						console.warn(`No latest version found for package: ${data.name}`);
						return null;
					}

					// Get last update date and deprecation status
					const updated = details.time?.[latest_version]
						? new Date(details.time[latest_version])
						: undefined;
					const deprecated = details.versions?.[latest_version]?.deprecated || false;

					// Update the package data
					const updatedData = {
						...data,
						downloads,
						updated: updated?.toISOString(),
						deprecated: deprecated || undefined // Only include if true
					};

					// Save updated data back to cache
					PackageCache.set(data.name, updatedData);

					// Track progress
					processedCount++;
					if (processedCount % 10 === 0 || processedCount === totalPackages) {
						console.log(
							`Progress: ${processedCount}/${totalPackages} (${Math.round((processedCount / totalPackages) * 100)}%)`
						);
					}

					// Store updated package info
					const packageInfo: Package = {
						...data,
						downloads,
						updated: updated?.toISOString(),
						deprecated
					};

					updatedPackages.push({ data: packageInfo as any, pkg_name: data.name });
					return packageInfo;
				} catch (error) {
					console.error(`Error processing package ${data.name}:`, error);
					return null;
				}
			})
			.catch((error) => {
				console.error(`Error fetching package ${data.name}:`, error);
				return null;
			});
	});

	// Wait for all updates to complete
	await Promise.all(promises);

	console.log(`Update completed for ${processedCount} packages`);
	return updatedPackages.filter(Boolean);
}

async function delete_untagged() {
	for await (const [pkg_name_file, data] of PackageCache.entries()) {
		if (!Array.isArray(data.tags)) {
			PackageCache.delete(data.name);
		}
	}
}

async function recheck_svelte_support() {
	for await (const [pkg_name, data] of PackageCache.entries()) {
		// Get package json
		const package_json = await superfetch(`${REGISTRY_BASE_URL}${pkg_name}`).then((r) => r.json());

		// Get latest versions package.json from versions field
		const latest_version = package_json['dist-tags']?.latest;
		if (!latest_version) continue;

		const latest_package_json = package_json.versions[latest_version];

		const svelte_version =
			latest_package_json.peerDependencies?.svelte ||
			latest_package_json.dependencies?.svelte ||
			latest_package_json.devDependencies?.svelte;

		const svelte_support = supports_svelte_versions(svelte_version);

		const old_svelte_support = data.svelte;

		data.svelte = svelte_support;

		if (JSON.stringify(old_svelte_support) !== JSON.stringify(data.svelte)) {
			console.log('UPDATING', pkg_name, svelte_support);

			PackageCache.set(pkg_name, data);
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

async function delete_legacy_svelte5_field() {
	for await (const [pkg_name, data] of PackageCache.entries()) {
		// @ts-expect-error
		if (data.svelte5) {
			// @ts-expect-error
			delete data.svelte5;
			PackageCache.set(pkg_name, data);
		}
	}
}

async function update_typescript_data() {
	for await (const [pkg_name, data] of PackageCache.entries()) {
		const package_detail = await superfetch(`${REGISTRY_BASE_URL}${pkg_name}`).then((r) =>
			r.json()
		);

		const latest = package_detail['dist-tags']?.latest;
		if (!latest) continue;

		const latest_package_json = package_detail.versions[latest];

		const typescript_data = await check_typescript_types(latest_package_json);
		data.typescript = typescript_data;
		PackageCache.set(pkg_name, data);
	}
}

/** @deprecated */
async function TEMPORARY_update_typescript_for_unmarked_to_accomodate_for_wrong_function() {
	for await (const [pkg_name, data] of PackageCache.entries()) {
		if (data.typescript.has_types) continue;

		console.log(`TRYING ${pkg_name}`);

		const package_detail = await superfetch(`${REGISTRY_BASE_URL}${pkg_name}`).then((r) =>
			r.json()
		);

		const latest = package_detail['dist-tags']?.latest;
		if (!latest) continue;

		const latest_package_json = package_detail.versions[latest];

		const typescript_data = await check_typescript_types(latest_package_json);
		data.typescript = typescript_data;
		PackageCache.set(pkg_name, data);
	}
}

for (let i = 0; i < 1; i++) {
	// await process_batches_through_llm();
}

// await update_overrides();

svelte_society_list;
// await process_packages_by_names_through_llm({
// 	package_names: Object.keys(svelte_society_list),
// 	force_include_all_packages: true
// });

// update_cache_from_npm();
// await update_all_github_data();

// await remove_forks();
// delete_untagged();

// await PackageCache.format_all();
// await recheck_svelte_support();

// await delete_legacy_svelte5_field();
// await update_typescript_data();
// TEMPORARY_update_typescript_for_unmarked_to_accomodate_for_wrong_function();

// program.name('packages').description('Package to curate the svelte.dev/packages list');

// program.command('update').addArgument({ name: 'github-stars', required: false });
