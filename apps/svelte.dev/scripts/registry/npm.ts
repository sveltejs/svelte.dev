import * as fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Package } from '../../src/lib/server/content.js';

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

	static stringify(package_details: Package) {
		return JSON.stringify(package_details, null, 2);
	}

	static parse(markdown: string) {
		return JSON.parse(markdown);
	}

	static async get(pkg_name: string): Promise<Package | null> {
		try {
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
		await fsp.writeFile(this.#get_full_path(pkg_name), this.stringify(data));
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
						const res = await fetch(url, fetch_options);

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
const REGISTRY_BASE_URL = 'https://registry.npmjs.org/';

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
 * Gets details for a package from the npm registry
 */
export async function fetch_details_for_package(pkg_name: string): Promise<any> {
	const url = new URL(`${REGISTRY_BASE_URL}-/v1/search`);
	url.searchParams.set('text', pkg_name); // Search for the exact package name
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

/**
 * Gets the number of packages that depend on a given package and weekly downloads
 * by using npm search API to find the exact package
 */
export async function fetch_package_stats(
	pkg_name: string
): Promise<{ dependents: number; downloads: number; authors: string[] }> {
	try {
		// Find the exact package name match
		const matched_package = await fetch_details_for_package(pkg_name);

		if (!matched_package) {
			console.log(`No exact match found for package ${pkg_name} in search results`);
			return { dependents: 0, downloads: 0, authors: [] };
		}

		// Extract dependents and downloads
		return {
			dependents: matched_package.dependents || 0,
			downloads: matched_package.downloads?.weekly || 0,
			authors: matched_package.package.maintainers?.map((v: any) => v.username)
		};
	} catch (error) {
		console.error(`Error fetching stats for ${pkg_name}:`, error);
		return { dependents: 0, downloads: 0, authors: [] };
	}
}

/**
 * Analyzes package details to determine if it's a valid Svelte package and extracts metadata
 */
export async function process_package_details(
	pkg_name: string,
	package_json: any,
	check_svelte_dep_criteria = true,
	stats?: { dependents?: number; downloads?: number; authors: string[] }
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
				svelte5: false,
				runes: false,
				repo_url: '',
				dependents: stats?.dependents || 0,
				downloads: stats?.downloads || 0,
				authors: stats?.authors || []
			},
			package_json: package_json
		};

		// Skip certain packages
		if (pkg_name === 'svelte' || pkg_name === '@sveltejs/kit') return null;

		// Check Svelte dependencies
		const latest_package_json = package_json.versions[latest_version];

		if (check_svelte_dep_criteria) {
			if (
				!latest_package_json.dependencies?.svelte &&
				!latest_package_json.dependencies?.['@sveltejs/kit'] &&
				!latest_package_json.peerDependencies?.svelte &&
				!latest_package_json.peerDependencies?.['@sveltejs/kit'] &&
				!latest_package_json.devDependencies?.svelte &&
				!latest_package_json.devDependencies?.['@sveltejs/kit']
			) {
				console.log(`Package ${pkg_name} is not a Svelte package, skipping`);
				return null; // Skip non-Svelte packages
			}

			// Get Svelte version
			const svelte_version =
				latest_package_json.dependencies?.svelte ??
				latest_package_json.peerDependencies?.svelte ??
				latest_package_json.devDependencies?.svelte;

			const is_svelte_5 = supports_svelte5(svelte_version);
			if (is_svelte_5) {
				interim_pkg.meta.svelte5 = true;
			}
		}

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
			const package_json = await superfetch(`${REGISTRY_BASE_URL}${pkg_name}`).then((r) =>
				r.json()
			);

			// Get package stats
			const stats = await fetch_package_stats(pkg_name);

			// Process package details
			const interim_pkg = await process_package_details(
				pkg_name,
				package_json,
				options.check_svelte_dep_criteria,
				stats
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

/**
 * Checks if a semver range supports Svelte version 5.x
 *
 * @param {string} version_range - The semver version range to check
 * @returns {boolean} - True if the range supports Svelte 5, false otherwise
 */
function supports_svelte5(version_range: string): boolean {
	if (!version_range) return false;

	// Handle complex range patterns first to prevent matching simpler patterns

	// Handle complex version ranges with both upper and lower bounds (e.g., ">=3.0.0 <6.0.0")
	if (
		(version_range.includes('<') || version_range.includes('<=')) &&
		(version_range.includes('>=') || version_range.includes('>'))
	) {
		// Extract lower bound
		let lower_bound = 0;
		let lower_bound_operator = '>=';

		if (version_range.includes('>=')) {
			const match = version_range.match(/>=\s*(\d+(\.\d+)*)/);
			if (match) {
				lower_bound = parseFloat(match[1]);
				lower_bound_operator = '>=';
			}
		} else if (version_range.includes('>')) {
			const match = version_range.match(/>\s*(\d+(\.\d+)*)/);
			if (match) {
				lower_bound = parseFloat(match[1]);
				lower_bound_operator = '>';
			}
		}

		// Extract upper bound
		let upper_bound = Infinity;
		let upper_bound_operator = '<';

		if (version_range.includes('<')) {
			const match = version_range.match(/<\s*(\d+(\.\d+)*)/);
			if (match) {
				upper_bound = parseFloat(match[1]);
				upper_bound_operator = '<';
			}
		} else if (version_range.includes('<=')) {
			const match = version_range.match(/<=\s*(\d+(\.\d+)*)/);
			if (match) {
				upper_bound = parseFloat(match[1]);
				upper_bound_operator = '<=';
			}
		}

		// Special case: If the upper bound is exactly 5 with '<', version 5 is excluded
		if (upper_bound_operator === '<' && upper_bound === 5) {
			return false;
		}

		// Check if version 5 is within the range
		const is_lower_bound_satisfied =
			lower_bound_operator === '>=' ? lower_bound <= 5 : lower_bound < 5;
		const is_upper_bound_satisfied =
			upper_bound_operator === '<' ? upper_bound > 5 : upper_bound >= 5;

		return is_lower_bound_satisfied && is_upper_bound_satisfied;
	}

	// Handle version range with OR operators
	if (version_range.includes('||')) {
		const ranges = version_range.split('||').map((r) => r.trim());
		// If any sub-range supports v5, the whole range supports it
		return ranges.some((range) => supports_svelte5(range));
	}

	// Handle exact major version format (5)
	if (version_range === '5') return true;

	// Handle caret ranges like ^5 or ^5.0.0
	if (version_range.startsWith('^5')) return true;

	// Handle tilde ranges like ~5 or ~5.0.0
	if (version_range.startsWith('~5')) return true;

	// Handle wildcard (*) by itself, which means any version
	if (version_range === '*') return true;

	// Handle * and x ranges (e.g., "5.x", "5.*")
	if (
		version_range.startsWith('5.') &&
		(version_range.endsWith('*') || version_range.endsWith('x'))
	) {
		return true;
	}

	// Handle version ranges with hyphen notation
	if (version_range.includes(' - ')) {
		const [start, end] = version_range.split(' - ').map((v) => parseFloat(v));
		return end >= 5;
	}

	// Handle >= ranges (after checking for complex ranges)
	if (version_range.startsWith('>=')) {
		const version_number = parseFloat(version_range.substring(2));
		return version_number <= 5;
	}

	// Handle > ranges
	if (version_range.startsWith('>')) {
		const version_number = parseFloat(version_range.substring(1));
		return version_number < 5;
	}

	// Handle <= ranges
	if (version_range.startsWith('<=')) {
		const version_number = parseFloat(version_range.substring(2));
		return version_number >= 5;
	}

	// Handle < ranges
	if (version_range.startsWith('<')) {
		const version_number = parseFloat(version_range.substring(1));
		return version_number > 5;
	}

	// Handle exact versions of non-5 (like 4.0.0 or 6.0.0)
	if (/^\d+(\.\d+)*$/.test(version_range)) {
		const major_version = parseInt(version_range.split('.')[0]);
		return major_version === 5;
	}

	// Handle other caret ranges (^4.x.x, ^6.x.x)
	if (version_range.startsWith('^')) {
		const major_version = parseInt(version_range.substring(1).split('.')[0]);
		return major_version === 5;
	}

	// Handle other tilde ranges (~4.x.x, ~6.x.x)
	if (version_range.startsWith('~')) {
		const major_version = parseInt(version_range.substring(1).split('.')[0]);
		return major_version === 5;
	}

	// Handle other x-ranges (4.x, 6.x)
	if (version_range.includes('.x') || version_range.includes('.*')) {
		const major_version = parseInt(version_range.split('.')[0]);
		return major_version === 5;
	}

	return false;
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
		svelte5: boolean;
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
	data.description = structured_package.meta.description;

	data.repo_url = structured_package.meta.repo_url;

	data.authors = structured_package.meta.authors;
	data.homepage = structured_package.package_json.homepage;
	data.downloads = structured_package.meta.downloads;
	data.dependents = structured_package.meta.dependents;
	data.updated = structured_package.meta.last_updated;
	data.tags = structured_package.meta.tags;
	data.github_stars = structured_package.meta.github_stars;
	data.svelte5 = structured_package.meta.svelte5;
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
						if (total_runs >= limit) break;

						all_seen_packages.add(pkg_name); // Mark this package as seen

						try {
							// Get package details
							const package_json = await superfetch(`${REGISTRY_BASE_URL}${pkg_name}`).then((v) =>
								v.json()
							);

							// Use stats from search results
							const stats = {
								dependents: obj.dependents || 0,
								downloads: obj.downloads?.weekly || 0,
								authors: obj.package.maintainers?.map((v: any) => v.username) ?? []
							};

							// Process package details
							const interim_pkg = await process_package_details(
								pkg_name,
								package_json,
								true,
								stats
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
