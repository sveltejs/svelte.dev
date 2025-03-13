import * as fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { extract_frontmatter } from '@sveltejs/site-kit/markdown';
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
				this.running--;
				item.resolve(result);
			})
			.catch((err) => {
				this.running--;
				item.reject(err);
			})
			.finally(() => {
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

	static stringify(package_details: Package) {
		let frontmatter = `---\nname: "${package_details.name}"\n`;

		if (package_details.description) {
			frontmatter += `description: "${package_details.description}"\n`;
		}

		if (package_details.repo_url) {
			frontmatter += `repo_url: "${sanitize_github_url(package_details.repo_url)}"\n`;
		}

		if (package_details.author) {
			frontmatter += `author: "${package_details.author}"\n`;
		}

		if (package_details.homepage) {
			frontmatter += `homepage: "${package_details.homepage}"\n`;
		}

		if (package_details.downloads) {
			frontmatter += `downloads: ${package_details.downloads}\n`;
		}

		if (package_details.dependents) {
			frontmatter += `dependents: ${package_details.dependents}\n`;
		}

		if (package_details.updated) {
			frontmatter += `updated: "${package_details.updated}"\n`;
		}

		if (package_details.deprecated) {
			frontmatter += `deprecated: true\n`;
		}

		if (package_details.github_stars) {
			frontmatter += `github_stars: ${package_details.github_stars}\n`;
		}

		frontmatter += `tags: \n${package_details.tags.map((tag = '') => `  - ${tag}`).join('\n')}\n`;

		frontmatter += '---\n';

		return frontmatter;
	}

	static parse(markdown: string) {
		const { metadata } = extract_frontmatter(markdown);

		return metadata;
	}

	static async get(pkg_name: string): Promise<Package | null> {
		const pathname = path.resolve(
			path.dirname(fileURLToPath(import.meta.url)),
			`../../src/lib/server/generated/registry/${PackageCache.#clean_name(pkg_name)}.md`
		);

		try {
			return PackageCache.parse(await fsp.readFile(pathname, { encoding: 'utf8' }));
		} catch {
			return null;
		}
	}

	static async has(pkg_name: string): Promise<boolean> {
		const pathname = path.resolve(
			path.dirname(fileURLToPath(import.meta.url)),
			`../../src/lib/server/generated/registry/${PackageCache.#clean_name(pkg_name)}.md`
		);

		try {
			await fsp.stat(pathname);
			return true;
		} catch {
			return false;
		}
	}

	static async set(pkg_name: string, data: Package) {
		const pathname = path.resolve(
			path.dirname(fileURLToPath(import.meta.url)),
			`../../src/lib/server/generated/registry/${PackageCache.#clean_name(pkg_name)}.md`
		);

		await fsp.writeFile(pathname, PackageCache.stringify(data));
	}

	static async *entries() {
		const cache_dir = path.resolve(
			path.dirname(fileURLToPath(import.meta.url)),
			'../../src/lib/server/generated/registry'
		);
		const cache_dir_contents = await fsp.readdir(cache_dir);

		for (const dirent of cache_dir_contents) {
			const file_path = path.join(cache_dir, dirent);
			yield [
				dirent.replace(/.md$/, ''),
				PackageCache.parse(await fsp.readFile(file_path, 'utf8'))
			] as [string, Package];
		}
	}
}

/**
 * Sanitizes GitHub URLs to a standard format
 */
export function sanitize_github_url(url: string): string {
	return url
		.replace('ssh://', '')
		.replace('git+', '')
		.replace('.git', '')
		.replace('git:', 'https:')
		.replace('git@github.com:', 'https://github.com/')
		.replace('git@github.com/', 'https://github.com/');
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

const API_BASE_URL = 'https://api.npmjs.org/downloads';
const REGISTRY_BASE_URL = 'https://registry.npmjs.org/';

const END_DATE = format(new Date(), 'yyyy-MM-dd');
const START_DATE = format(sub_days(new Date(), 30), 'yyyy-MM-dd');

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
export async function fetch_details_for_package(pkg: string) {
	const registry_data = await superfetch(`${REGISTRY_BASE_URL}${pkg}`, { headers: HEADERS }).then(
		(r) => r.json()
	);

	return registry_data;
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
	};
	// Returned contents from registry.npmjs.org API
	package_json: any;
};

export function structure_package_to_package(
	structured_package: StructuredInterimPackage
): Package {
	const data = {} as Package;

	data.name = structured_package.package_json.name;
	data.description = structured_package.meta.description;
	data.repo_url = structured_package.package_json.repository?.url;
	data.author =
		structured_package.package_json.author?.name ??
		structured_package.package_json.maintainers[0].name;
	data.homepage = structured_package.package_json.homepage;
	data.downloads = structured_package.meta.downloads;
	data.dependents = structured_package.meta.dependents;
	data.updated = structured_package.meta.last_updated;
	data.tags = structured_package.meta.tags;
	data.github_stars = structured_package.meta.github_stars;

	return data;
}

export async function* stream_search_by_keywords({
	keywords,
	ranking = 'quality',
	limit = Infinity,
	fetch = { package_json: true },
	batch_size = 10,
	skip_cached = false
}: SearchOptions): AsyncGenerator<Map<string, StructuredInterimPackage>> {
	let total_runs = 0;
	let collected_packages = new Map<string, StructuredInterimPackage>();
	// Keep track of all seen packages across all batches
	const all_seen_packages = new Set<string>();

	for (const keyword of keywords) {
		let page = 0;
		let has_more_results = true;

		listing_loop: while (has_more_results && total_runs < limit) {
			// Fetch a page of results
			const url = new URL(`${REGISTRY_BASE_URL}-/v1/search`);
			url.searchParams.set('text', `keywords:${keyword}`);
			url.searchParams.set('ranking', ranking);
			url.searchParams.set('size', String(PAGE_SIZE));
			url.searchParams.set('from', String(page * PAGE_SIZE));

			console.log(`Fetching page ${page + 1} of results for keyword: ${keyword}`);

			try {
				const results = await superfetch(url, {
					headers: HEADERS
				}).then((r) => r.json());

				// Break if no more results
				if (!results.objects || results.objects.length === 0) {
					has_more_results = false;
					break;
				}

				// Process each package
				for (const obj of results.objects) {
					if (skip_cached && (await PackageCache.has(obj.package.name))) continue;
					// Check if we've seen this package before (either in current batch or previous batches)
					if (all_seen_packages.has(obj.package.name)) {
						console.log(
							`Detected duplicate package ${obj.package.name}, breaking search loop for this keyword`
						);
						has_more_results = false;
						break listing_loop;
					}

					const interim_pkg: StructuredInterimPackage = {
						meta: {
							deprecated: false,
							last_updated: '',
							tags: []
						},
						package_json: null as any
					};

					// Mark this package as seen
					all_seen_packages.add(obj.package.name);

					// Skip if we've reached the limit
					if (total_runs >= limit) break;

					// Exclude 'svelte' and '@sveltejs/kit' package
					if (obj.package.name === 'svelte' || obj.package.name === '@sveltejs/kit') {
						continue;
					}

					// Fetch package.json if needed
					if (fetch.package_json) {
						try {
							const response = await fetch_details_for_package(obj.package.name);

							const latest_version = response['dist-tags']?.latest;

							// Make sure that either dependencies/peer dependencies have svelte or @sveltejs/kit
							const latest_package_json = response.versions[latest_version];
							if (
								!latest_package_json.dependencies?.svelte &&
								!latest_package_json.dependencies?.['@sveltejs/kit'] &&
								!latest_package_json.peerDependencies?.svelte &&
								!latest_package_json.peerDependencies?.['@sveltejs/kit'] &&
								!latest_package_json.devDependencies?.svelte &&
								!latest_package_json.devDependencies?.['@sveltejs/kit']
							) {
								continue;
							}

							if (latest_version && response.time && response.time[latest_version]) {
								interim_pkg.meta.last_updated = response.time[latest_version];
							}

							if (response.versions[latest_version].deprecated) {
								interim_pkg.meta.deprecated = true;
							}

							interim_pkg.meta.dependents = obj.dependents;
							interim_pkg.meta.downloads = obj.downloads.weekly;

							interim_pkg.package_json = response;
							interim_pkg.package_json.versions = Object.keys(interim_pkg.package_json.versions);
						} catch (err) {
							console.error(`Error fetching package.json for ${obj.package.name}:`, err);
							continue; // Skip this package if we can't get its details
						}
					}

					// Add to our collection
					collected_packages.set(obj.package.name, interim_pkg);

					// Yield when we reach the requested batch size
					if (collected_packages.size >= batch_size) {
						console.log(`Yielding batch of ${collected_packages.size} packages`);
						yield collected_packages;
						collected_packages = new Map(); // Reset collection after yielding
					}

					total_runs++;
				}

				// Move to next page
				page++;
			} catch (error) {
				console.error(`Error fetching search results for ${keyword}, page ${page}:`, error);
				has_more_results = false;
			}
		}
	}

	// Yield any remaining packages
	if (collected_packages.size > 0) {
		console.log(`Yielding final batch of ${collected_packages.size} packages`);
		yield collected_packages;
	}
}
