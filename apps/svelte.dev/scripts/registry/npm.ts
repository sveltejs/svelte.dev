import * as fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Package } from '../../src/lib/server/content.js';
import { check, format as prettier_format, resolveConfig, type Options } from 'prettier';

/**
 * Simple queue implementation for limiting concurrent requests
 */
export class RequestQueue {
	/** Number of concurrent operations allowed */
	concurrency: number;

	/** Number of currently running operations */
	running = 0;

	/** Queue of pending operations */
	queue: Array<{
		fn: () => Promise<any>;
		resolve: (value: any) => void;
		reject: (reason?: any) => void;
	}> = [];

	/**
	 * Creates a new request queue with specified concurrency limit
	 */
	constructor(concurrency: number) {
		this.concurrency = concurrency;
	}

	/**
	 * Adds a function to the queue and returns a promise that resolves with its result
	 */
	enqueue<T>(fn: () => Promise<T>): Promise<T> {
		return new Promise((resolve, reject) => {
			this.queue.push({ fn, resolve, reject });
			this.dequeue();
		});
	}

	/**
	 * Processes the next item in the queue if concurrency limit allows
	 */
	dequeue(): void {
		if (this.running >= this.concurrency) return;

		const item = this.queue.shift();
		if (!item) return;

		this.running++;

		Promise.resolve(item.fn())
			.then((result) => {
				console.log('RESOLVING', result?.url);
				item.resolve(result);
			})
			.catch((err) => {
				item.reject(err);
			})
			.finally(() => {
				this.running--;
				this.dequeue();
			});
	}
}

/** Singleton request queue instance */
export let request_queue = new RequestQueue(10);

/** Configuration options for superfetch */
export interface SuperfetchOptions {
	/** Maximum concurrent requests */
	concurrency?: number;

	/** Maximum retry attempts */
	retries?: number;

	/** Base delay between retries in ms */
	retry_delay?: number;
}

export class PackageCache {
	static #prettier_config: Options | undefined;

	static #clean_name(name: string) {
		return name.replace(/@/g, '').replace(/\//g, '-');
	}

	static #root_dir = path.resolve(
		path.dirname(fileURLToPath(import.meta.url)),
		`../../src/lib/server/generated/registry`
	);

	static #get_full_path(name: string) {
		return path.resolve(this.#root_dir, `${this.#clean_name(name)}.json`);
	}

	static async stringify(package_details: Package) {
		if (!this.#prettier_config) {
			this.#prettier_config = {
				...(await resolveConfig(new URL('../../.prettierrc', import.meta.url).pathname))!,
				parser: 'json'
			};
		}

		return prettier_format(JSON.stringify(package_details, null, 2), this.#prettier_config);
	}

	static async format_all() {
		for await (const [pkg_name, data] of this.entries()) {
			await this.set(pkg_name, data);
		}
	}

	static parse(text: string) {
		return JSON.parse(text);
	}

	static async get(pkg_name: string): Promise<Package | null> {
		try {
			console.log(pkg_name);
			return this.parse(await fsp.readFile(this.#get_full_path(pkg_name), { encoding: 'utf8' }));
		} catch {
			return null;
		}
	}

	static async has(pkg_name: string): Promise<boolean> {
		try {
			await fsp.stat(this.#get_full_path(pkg_name));
			return true;
		} catch {
			return false;
		}
	}

	static async set(pkg_name: string, data: Package) {
		await fsp.writeFile(this.#get_full_path(pkg_name), await this.stringify(data));
	}

	static async delete(pkg_name: string) {
		try {
			await fsp.unlink(this.#get_full_path(pkg_name));
		} catch {}
	}

	static async *entries() {
		const cache_dir_contents = await fsp.readdir(this.#root_dir);

		for (const dirent of cache_dir_contents) {
			const file_path = path.join(this.#root_dir, dirent);
			const parsed = this.parse(await fsp.readFile(file_path, 'utf8'));
			yield [parsed.name, parsed] as [string, Package];
		}
	}
}

/**
 * Sanitizes GitHub URLs to a standard format
 */
export function sanitize_github_url(url: string): string {
	if (!url || typeof url !== 'string') return url;

	// Handle the simple case of just owner/repo format
	if (/^[^\/:\s]+\/[^\/:\s]+$/.test(url) && !url.includes('github')) {
		return `https://github.com/${url}`;
	}

	// Remove fragments and query parameters
	url = url.split('#')[0].split('?')[0];

	// Remove additional path segments after repo name
	if (url.includes('github.com')) {
		const basic_repo_pattern =
			/^((?:https?:\/\/|git@|git:\/\/|ssh:\/\/git@|git\+https?:\/\/|git\+ssh:\/\/git@)?(?:github\.com)[\/:]([^\/\s]+\/[^\/\s]+))(?:\/|\.git|$)/i;
		const basic_match = url.match(basic_repo_pattern);
		if (basic_match) {
			url = basic_match[1];
		}
	}

	// Now standardize the URL format
	return url
		.replace(/^git\+/, '') // Remove git+ prefix
		.replace(/^ssh:\/\//, '') // Remove ssh:// prefix
		.replace(/^git:\/\/github\.com\//, 'https://github.com/') // Replace git:// with https://
		.replace(/^git:github\.com\//, 'https://github.com/') // Replace git:github with https://github
		.replace(/^git:/, 'https:') // Replace git: with https:
		.replace(/^git@github\.com:/, 'https://github.com/') // Replace git@github.com: with https://github.com/
		.replace(/^git@github\.com\//, 'https://github.com/') // Replace git@github.com/ with https://github.com/
		.replace(/^github\.com\//, 'https://github.com/') // Add https:// if missing
		.replace(/^http:\/\/github\.com\//, 'https://github.com/') // Replace http:// with https:// for GitHub
		.replace(/\.git$/, ''); // Remove .git suffix
}

/**
 * Fetch JSON with concurrency limit and retry logic
 * Skip retries for 404 responses
 */
export function superfetch(
	url: string | URL,
	fetch_options?: RequestInit,
	options: SuperfetchOptions = {}
): Promise<Response> {
	const { concurrency = 10, retries = 10, retry_delay = 2000 } = options;

	// Create a singleton request queue if it doesn't exist
	if (!request_queue) {
		request_queue = new RequestQueue(concurrency);
	}

	let attempt = 0;

	/**
	 * Performs a single fetch attempt with backoff
	 */
	function attempt_fetch(): Promise<Response> {
		attempt++;

		// Calculate backoff delay based on current attempt
		const backoff_delay = attempt > 1 ? retry_delay * (attempt - 1) : 0;

		return new Promise((resolve, reject) => {
			// Apply backoff delay
			setTimeout(() => {
				// Use the request queue to limit concurrency
				request_queue!
					.enqueue(async () => {
						const res = await fetch(url, { cache: 'force-cache', ...fetch_options });

						if (!res.ok) {
							// Don't retry 404s, just return them
							if (res.status === 404) {
								console.log(`404 Not Found for ${url} (Not retrying)`);
								return res;
							}

							console.error(`[${url}] ${res.status} ${res.statusText} (Attempt ${attempt})`);
							throw new Error(`HTTP error ${res.status}`);
						}
						return res;
					})
					.then(resolve)
					.catch((err) => {
						if (attempt >= retries) {
							reject(new Error(`Failed after ${retries} attempts: ${err.message}`));
						} else {
							reject(err);
						}
					});
			}, backoff_delay);
		});
	}

	// Implement retry logic
	return new Promise((resolve, reject) => {
		/**
		 * Recursively tries to fetch until success or max retries reached
		 */
		function try_fetch() {
			attempt_fetch()
				.then((v) => resolve(v))
				.catch((err) => {
					if (attempt >= retries) {
						reject(err);
					} else {
						try_fetch();
					}
				});
		}

		try_fetch();
	});
}

export const HEADERS = { 'User-Agent': 'svelte.dev/registry; v0.5' };

/**
 * Subtracts a specified number of days from a date
 */
function sub_days(date: Date, days: number): Date {
	const result = new Date(date);
	result.setDate(date.getDate() - days);
	return result;
}

/**
 * Formats a date according to a simple format string
 */
function format(date: Date, format_str: string): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');

	return format_str.replace('yyyy', year.toString()).replace('MM', month).replace('dd', day);
}

const API_BASE_URL = 'https://api.npmjs.org/';
export const REGISTRY_BASE_URL = 'https://registry.npmjs.org/';

const END_DATE = format(new Date(), 'yyyy-MM-dd');
const START_DATE = format(sub_days(new Date(), 7), 'yyyy-MM-dd');

const PAGE_SIZE = 100;

/**
 * Gets the number of weekly downloads for an npm package
 */
export async function fetch_downloads_for_package(pkg: string): Promise<number> {
	return superfetch(`${API_BASE_URL}downloads/point/${START_DATE}:${END_DATE}/${pkg}`, {
		headers: HEADERS
	})
		.then((r) => r.json())
		.then((res) => res.downloads)
		.catch(() => 0);
}

/**
 * Determines if a package ships with TypeScript types and checks for separate @types
 * package if first-party types aren't included
 *
 * @param package_json - The parsed package.json object
 * @returns An object with information about type availability
 */
export async function check_typescript_types(
	package_json: any
): Promise<'first-party' | '@types' | 'none'> {
	// Check for types or typings field in package.json (traditional approach)
	if (package_json.types || package_json.typings) {
		return 'first-party';
	}

	// Check export maps for TypeScript typings
	if (package_json.exports) {
		// Function to recursively check if an export condition contains types
		const check_export_for_types = (export_obj: any): boolean => {
			if (!export_obj || typeof export_obj !== 'object') {
				return false;
			}

			// Check if this is a conditional export with types
			if (export_obj.types || export_obj.typings) {
				return true;
			}

			// Modern pattern uses "import" condition
			if (export_obj.import?.types) {
				return true;
			}

			// TypeScript support could also be in these fields
			if (export_obj.default?.types || export_obj.require?.types) {
				return true;
			}

			// Recursive check for nested conditions
			return Object.values(export_obj).some(
				(value) => typeof value === 'object' && check_export_for_types(value)
			);
		};

		// Iterate through all export paths
		const has_types_in_exports = Object.values(package_json.exports).some((export_def) => {
			if (typeof export_def === 'string') {
				// Simple export string - check if it's a .d.ts file
				return export_def.endsWith('.d.ts');
			}
			return check_export_for_types(export_def);
		});

		if (has_types_in_exports) {
			return 'first-party';
		}
	}

	// Check if the files field includes TypeScript declaration files
	if (Array.isArray(package_json.files)) {
		const has_type_files = package_json.files.some((pattern: string) => {
			return (
				pattern.includes('*.d.ts') ||
				pattern.includes('**/*.d.ts') ||
				pattern.endsWith('.d.ts') ||
				pattern.includes('/types/') ||
				pattern.includes('/typings/') ||
				pattern === 'types' ||
				pattern === 'typings' ||
				pattern === 'dist/types' ||
				pattern === 'dist/typings'
			);
		});

		if (has_type_files) {
			return 'first-party';
		}
	}

	// Check if there's a @types package available
	const package_name = package_json.name;
	if (package_name) {
		try {
			// For scoped packages, transform @scope/package to @types/scope__package
			let types_package_name;
			if (package_name.startsWith('@')) {
				// Convert @scope/package to scope__package
				types_package_name = package_name.slice(1).replace('/', '__');
			} else {
				// For regular packages, just use the package name
				types_package_name = package_name;
			}

			const types_package = `@types/${types_package_name}`;

			console.log('FETCHING DEFINITELYTYPED TYPES FOR', types_package);

			// Try to fetch metadata for the @types package
			const response = await superfetch(
				`https://registry.npmjs.org/${encodeURIComponent(types_package)}`
			);

			if (response.ok) {
				('@types');
			}
		} catch (error) {
			// Ignore fetch errors and fall through to the "no types" case
		}
	}

	// No types found
	return 'none';
}

/**
 * Gets details for a package from the npm registry
 */
export async function fetch_details_for_package(pkg_name: string): Promise<any> {
	const url = new URL(`${REGISTRY_BASE_URL}-/v1/search`);
	url.searchParams.set('text', `name:${pkg_name}`); // Search for the exact package name
	url.searchParams.set('size', '5'); // Limit to 5 results to keep it efficient

	const response = await superfetch(url, { headers: HEADERS, cache: 'force-cache' });

	if (!response.ok) {
		console.error(`Error searching for package ${pkg_name}: ${response.status}`);
		return { dependents: 0, downloads: 0 };
	}

	const data = await response.json();

	// Find the exact package name match
	const matched_package = data.objects?.find((obj: any) => obj.package.name === pkg_name);

	return matched_package;
}

// /**
//  * Gets the number of packages that depend on a given package and weekly downloads
//  * by using npm search API to find the exact package
//  */
// export async function fetch_package_stats(
// 	pkg_name: string
// ): Promise<{ dependents: number; downloads: number; authors: string[] }> {
// 	try {
// 		// Find the exact package name match
// 		const matched_package = await fetch_details_for_package(pkg_name);

// 		if (!matched_package) {
// 			console.log(`No exact match found for package ${pkg_name} in search results`);
// 			return { dependents: 0, downloads: 0, authors: [] };
// 		}

// 		// Extract dependents and downloads
// 		return {
// 			dependents: matched_package.dependents || 0,
// 			downloads: matched_package.downloads?.weekly || 0,
// 			authors: matched_package.package.maintainers?.map((v: any) => v.username)
// 		};
// 	} catch (error) {
// 		console.error(`Error fetching stats for ${pkg_name}:`, error);
// 		return { dependents: 0, downloads: 0, authors: [] };
// 	}
// }

/**
 * Analyzes package details to determine if it's a valid Svelte package and extracts metadata
 */
export async function process_package_details(
	pkg_name: string,
	package_json: any,
	check_svelte_dep_criteria = true,
	authors: string[],
	downloads?: number
): Promise<StructuredInterimPackage | null> {
	try {
		const latest_version = package_json['dist-tags']?.latest;

		if (!latest_version) {
			console.log(`No latest version found for ${pkg_name}`);
			return null;
		}

		// Create a structured interim package
		const interim_pkg: StructuredInterimPackage = {
			meta: {
				deprecated: false,
				last_updated: '',
				tags: [],
				// @ts-expect-error
				typescript: {},
				runes: false,
				repo_url: '',
				downloads: downloads || 0,
				authors: authors || []
			},
			package_json: package_json
		};

		// Skip certain packages
		if (pkg_name === 'svelte') return null;

		// Check Svelte dependencies
		const latest_package_json = package_json.versions[latest_version];

		if (check_svelte_dep_criteria) {
			if (
				!latest_package_json.peerDependencies?.svelte &&
				!latest_package_json.peerDependencies?.['@sveltejs/kit'] &&
				!latest_package_json.dependencies?.svelte &&
				!latest_package_json.dependencies?.['@sveltejs/kit'] &&
				!latest_package_json.devDependencies?.svelte &&
				!latest_package_json.devDependencies?.['@sveltejs/kit']
			) {
				console.log(`Package ${pkg_name} is not a Svelte package, skipping`);
				return null; // Skip non-Svelte packages
			}
		}

		// Get Svelte version
		const svelte_version =
			latest_package_json.peerDependencies?.svelte ??
			latest_package_json.dependencies?.svelte ??
			latest_package_json.devDependencies?.svelte;

		const kit_version =
			latest_package_json.peerDependencies?.['@sveltejs/kit'] ??
			latest_package_json.dependencies?.['@sveltejs/kit'] ??
			latest_package_json.devDependencies?.['@sveltejs/kit'];

		interim_pkg.meta.svelte_range = svelte_version;
		interim_pkg.meta.kit_range = kit_version;

		interim_pkg.meta.typescript = await check_typescript_types(interim_pkg.package_json);

		// Get repository URL
		if (latest_package_json.repository) {
			interim_pkg.meta.repo_url = sanitize_github_url(latest_package_json.repository.url);
		}

		// Get last updated date
		if (latest_version && package_json.time && package_json.time[latest_version]) {
			interim_pkg.meta.last_updated = package_json.time[latest_version];
		}

		// Check if deprecated
		if (package_json.versions[latest_version].deprecated) {
			interim_pkg.meta.deprecated = true;
		}

		// Normalize versions to just keys
		interim_pkg.package_json.versions = Object.keys(interim_pkg.package_json.versions);

		return interim_pkg;
	} catch (error) {
		console.error(`Error processing package details for ${pkg_name}:`, error);
		return null;
	}
}

/**
 * Common batch yielding logic
 */
export async function* yield_batches<T>(
	items_generator: AsyncGenerator<[string, T]>,
	batch_size: number
): AsyncGenerator<Map<string, T>> {
	let batch = new Map<string, T>();

	for await (const [pkg_name, item] of items_generator) {
		batch.set(pkg_name, item);

		if (batch.size >= batch_size) {
			console.log(`Yielding batch of ${batch.size} packages`);
			yield batch;
			batch = new Map();
		}
	}

	if (batch.size > 0) {
		console.log(`Yielding final batch of ${batch.size} packages`);
		yield batch;
	}
}

/**
 * Generator function to process packages one by one
 */
export async function* process_packages(
	package_names: string[],
	options: {
		limit?: number;
		skip_cached?: boolean;
		check_svelte_dep_criteria?: boolean;
	} = {}
): AsyncGenerator<[string, StructuredInterimPackage]> {
	const { limit = Infinity, skip_cached = false } = options;
	const processed = new Set<string>();
	let count = 0;

	for (const pkg_name of package_names) {
		// Skip if we've reached the limit
		if (count >= limit) break;

		// Skip if already processed or cached
		if (processed.has(pkg_name) || (skip_cached && (await PackageCache.has(pkg_name)))) {
			continue;
		}

		processed.add(pkg_name);

		try {
			// Get package details
			const [package_json, downloads] = await Promise.all([
				superfetch(`${REGISTRY_BASE_URL}${pkg_name}`).then((r) => r.json()),
				fetch_downloads_for_package(pkg_name)
			]);

			// Process package details
			const interim_pkg = await process_package_details(
				pkg_name,
				package_json,
				options.check_svelte_dep_criteria,
				package_json.package.maintainers?.map((v: any) => v.username) ?? [],
				downloads
			);

			if (interim_pkg) {
				count++;
				yield [pkg_name, interim_pkg];
			}
		} catch (error) {
			console.error(`Error processing package ${pkg_name}:`, error);
		}
	}
}

/** Options for searching npm packages */
export interface SearchOptions {
	/** The keywords used to search npm, ex: `svelte-component` */
	keywords: string[];

	/** The sort order for results, default: `quality` */
	ranking?: string;

	/** The maximum number of results to return */
	limit?: number;

	/** Whether to fetch the full package.json */
	fetch?: {
		package_json?: boolean;
		github_stars?: boolean;
	};

	/** The size of each yielded batch */
	batch_size?: number;

	/** Whether to use the cache of markdown files */
	skip_cached?: boolean;

	exclude_official?: boolean;
}

export type StructuredInterimPackage = {
	meta: {
		deprecated: boolean;
		last_updated: string;
		tags: string[];
		description?: string;
		downloads?: number;
		dependents?: number;
		github_stars?: number;
		svelte_range?: string;
		typescript: Awaited<ReturnType<typeof check_typescript_types>>;
		kit_range?: string;
		runes: boolean;
		repo_url: string;
		fork_of?: string;
		authors: string[];
	};
	// Returned contents from registry.npmjs.org API
	package_json: any;
};

export function structured_interim_package_to_package(
	structured_package: StructuredInterimPackage
): Package {
	const data = {} as Package;

	data.name = structured_package.package_json.name;
	data.version = structured_package.package_json.version;
	data.description = structured_package.meta.description;

	data.typescript = structured_package.meta.typescript;

	data.repo_url = structured_package.meta.repo_url;

	data.authors = structured_package.meta.authors;
	data.homepage = structured_package.package_json.homepage;
	data.downloads = structured_package.meta.downloads;
	data.updated = structured_package.meta.last_updated;
	data.tags = structured_package.meta.tags;
	data.github_stars = structured_package.meta.github_stars;
	data.svelte_range = structured_package.meta.svelte_range;
	data.kit_range = structured_package.meta.kit_range;
	data.runes = structured_package.meta.runes;

	return data;
}

/**
 * Search for packages by keywords and stream results in batches
 */
export async function* stream_search_by_keywords({
	keywords,
	ranking = 'quality',
	limit = Infinity,
	batch_size = 10,
	skip_cached = false
}: Omit<SearchOptions, 'fetch'> & { batch_size?: number }): AsyncGenerator<
	Map<string, StructuredInterimPackage>
> {
	const all_seen_packages = new Set<string>();
	let total_runs = 0;

	// Generator function to search and process packages
	async function* search_and_process(): AsyncGenerator<[string, StructuredInterimPackage]> {
		for (const keyword of keywords) {
			let page = 0;
			let has_more_results = true;

			overlord_loop: while (has_more_results && total_runs < limit) {
				// Fetch a page of results
				const url = new URL(`${REGISTRY_BASE_URL}-/v1/search`);
				url.searchParams.set('text', `keywords:${keyword}`);
				url.searchParams.set('ranking', ranking);
				url.searchParams.set('size', String(PAGE_SIZE));
				url.searchParams.set('from', String(page * PAGE_SIZE));

				console.log(`Fetching page ${page + 1} of results for keyword: ${keyword}`);

				try {
					const results = await superfetch(url, { headers: HEADERS }).then((r) => r.json());

					// Break if no more results
					if (!results.objects || results.objects.length === 0) {
						has_more_results = false;
						break;
					}

					// Process each package
					for (const obj of results.objects) {
						const pkg_name = obj.package.name;

						// Skip certain packages
						if (pkg_name === 'svelte' || pkg_name === '@sveltejs/kit') continue;
						if (skip_cached && (await PackageCache.has(pkg_name))) continue;
						if (all_seen_packages.has(pkg_name)) break overlord_loop; // Skip already seen packages
						if (total_runs >= limit) break overlord_loop;

						all_seen_packages.add(pkg_name); // Mark this package as seen

						try {
							// Get package details
							const package_json = await superfetch(`${REGISTRY_BASE_URL}${pkg_name}`).then((v) =>
								v.json()
							);

							const downloads = obj.downloads?.weekly || 0;
							const authors = obj.package.maintainers?.map((v: any) => v.username) ?? [];

							// Process package details
							const interim_pkg = await process_package_details(
								pkg_name,
								package_json,
								true,
								authors,
								downloads
							);

							if (interim_pkg) {
								total_runs++;
								yield [pkg_name, interim_pkg];
							}
						} catch (error) {
							console.error(`Error processing package ${pkg_name}:`, error);
						}
					}

					page++;
				} catch (error) {
					console.error(`Error fetching search results for ${keyword}, page ${page}:`, error);
					has_more_results = false;
				}
			}
		}
	}

	// Use the common batch yielding logic
	yield* yield_batches(search_and_process(), batch_size);
}

/**
 * Stream packages by specific names instead of keywords
 */
export async function* stream_packages_by_names({
	package_names,
	limit = Infinity,
	batch_size = 10,
	skip_cached = false
}: {
	package_names: string[];
	limit?: number;
	batch_size?: number;
	skip_cached?: boolean;
}): AsyncGenerator<Map<string, StructuredInterimPackage>> {
	// Use the common process_packages generator
	const packages_generator = process_packages(package_names, {
		limit,
		skip_cached,
		check_svelte_dep_criteria: false
	});

	// Use the common batch yielding logic
	yield* yield_batches(packages_generator, batch_size);
}
