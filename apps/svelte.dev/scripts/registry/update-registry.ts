import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';
import dotenv from 'dotenv';
import fs, { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PACKAGES_META } from '../../src/lib/packages-meta.js';
import type { Package } from '../../src/lib/server/content.js';
import svelte_society_list from '../../src/lib/society-npm.json' with { type: 'json' };
import { sort_downloads } from '../../src/routes/packages/search.js';
import {
	build_flat_graph_from_package_json,
	composite_runes_types_check,
	fetch_package_download_history,
	HEADERS,
	PackageCache,
	REGISTRY_BASE_URL,
	request_queue,
	sanitize_github_url,
	stream_packages_by_names,
	stream_search_by_keywords,
	structured_interim_package_to_package,
	superfetch,
	type StructuredInterimPackage
} from './npm.js';

dotenv.config({ path: '.env.local' });

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

						if (json[pkg_name].runes) {
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

	try {
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

		console.log(`Fetching stars for ${owner}/${repo}`);
		const response = await superfetch(api_url, {
			headers: {
				...HEADERS,
				Accept: 'application/vnd.github.v3.star+json',
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
		console.error(`Error fetching stars for ${repo_url}:`, error, { sanitized_url });
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
		const max = Array.from(set).sort((a, b) => sort_downloads(a, b))[0];

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
async function update_cache(update: { stats?: boolean; composite?: boolean; graph?: boolean }) {
	update.composite ??= true;
	update.graph ??= true;
	update.stats ??= true;

	for await (const [pkg_name, data] of PackageCache.entries()) {
		// TODO: REMOVE
		if (data.dependency_tree) continue;

		const package_detail = await superfetch(`${REGISTRY_BASE_URL}${pkg_name}`).then((r) =>
			r.json()
		);

		const latest = package_detail['dist-tags']?.latest;
		if (!latest) continue;

		const latest_package_json = package_detail.versions[latest];

		// @ts-expect-error
		delete data.svelte;
		// @ts-expect-error
		delete data.svelte5;
		// @ts-expect-error
		delete data.dependents;
		// @ts-expect-error
		delete data.unpackedSize;
		// @ts-expect-error
		delete data.dependencies;
		// @ts-expect-error
		delete data.unpacked_size;

		let dep_tree_promise: ReturnType<typeof build_flat_graph_from_package_json> =
			Promise.resolve() as any;
		if (update.graph) {
			console.log('huh', data.dependency_tree);
			dep_tree_promise = build_flat_graph_from_package_json(latest_package_json);
		}

		let composite_promise: ReturnType<typeof composite_runes_types_check> =
			Promise.resolve() as any;
		if (update.composite)
			composite_promise = composite_runes_types_check(pkg_name, latest_package_json.version);

		data.version = latest_package_json.version;
		data.updated = package_detail.time?.[latest];
		data.svelte_range =
			latest_package_json.peerDependencies?.svelte ??
			latest_package_json.dependencies?.svelte ??
			latest_package_json.devDependencies?.svelte;

		data.kit_range =
			latest_package_json.peerDependencies?.['@sveltejs/kit'] ??
			latest_package_json.dependencies?.['@sveltejs/kit'] ??
			latest_package_json.devDependencies?.['@sveltejs/kit'];

		let download_promise = Promise.resolve(null) as unknown as Promise<
			Package['downloads_history']
		>;
		let github_promise = Promise.resolve(null) as unknown as Promise<{
			stars: number;
			homepage: string;
		} | null>;

		if (update.stats) {
			download_promise = fetch_package_download_history(pkg_name, data.downloads_history);
			github_promise = data.repo_url
				? fetch_github_data(data.repo_url)
				: Promise.resolve({
						stars: 0,
						homepage: ''
					});
		}

		const [dep_tree, composite_check, downloads_history, github_data] = await Promise.all([
			dep_tree_promise,
			composite_promise,
			download_promise,
			github_promise
		]);

		if (update.graph) data.dependency_tree = dep_tree;

		if (update.composite) {
			data.typescript = composite_check.types;
			data.runes = composite_check.runes;
		}

		if (update.stats) {
			if (downloads_history) data.downloads_history = downloads_history;

			if (github_data) data.github_stars = github_data.stars;
		}

		data.last_rune_check_version = latest_package_json.version;

		PackageCache.set(pkg_name, data);
	}
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

async function check_graph(pkg: string, semver: string) {
	const package_json_data = await superfetch(`${REGISTRY_BASE_URL}${pkg}/${semver}`, {
		headers: HEADERS
	}).then((r) => r.json());

	const flat_graph = await build_flat_graph_from_package_json(package_json_data, 5);

	console.log(JSON.stringify(flat_graph));

	console.log(`Built dependency graph for ${pkg}@${semver} from cache`);
	console.log(`- Total packages: ${flat_graph.packages.length}`);
	console.log(`- Total dependencies: ${flat_graph.dependencies.length}`);
	console.log(`- Circular dependencies: ${flat_graph.circular.length}`);
}

/**
 * Converts download history from the old format to the new format
 * Old format: { range: [number, number], value: number }[]
 * New format: [number, number][] where [day_number, value]
 *
 * @param old_data The download history in old format
 * @returns The download history in new format
 */
function convert_download_history_format(
	old_data: { range: [number, number]; value: number }[]
): [number, number][] {
	// January 1, 2014 00:00:00 UTC
	const base_date = Date.UTC(2014, 0, 1);

	return old_data.map((item) => {
		// Get the start timestamp from the range
		const start_timestamp = item.range[0];

		// Convert to day number (days since Jan 1, 2014)
		const day_number = Math.floor((start_timestamp - base_date) / (1000 * 60 * 60 * 24));

		// Return as tuple [day_number, value]
		return [day_number, item.value];
	});
}

async function convert_download_history_format_old() {
	for await (const [pkg_name, data] of PackageCache.entries()) {
		if (!Array.isArray(data.downloads_history)) {
			PackageCache.set(pkg_name, data);
			continue;
		}

		data.downloads_history = convert_download_history_format(data.downloads_history as any);
		PackageCache.set(pkg_name, data);
	}
}

// update_versions_only();

for (let i = 0; i < 1; i++) {
	// await process_batches_through_llm();
}

// await update_overrides();

// update_cache({
// 	composite: false,
// 	graph: true,
// 	stats: false
// });

convert_download_history_format_old();

// console.log(await fetch_package_download_history('neotraverse'));

// update_composite_ts_runes_data();

// console.log(await composite_runes_types_check('uifox', '0.0.5'));

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

// await check_graph('nxext-svelte-16', 'latest');
