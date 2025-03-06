import * as fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { extract_frontmatter } from '@sveltejs/site-kit/markdown';

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
				this.dequeue();
			})
			.catch((err) => {
				this.running--;
				item.reject(err);
				this.dequeue();
			});
	}
}

/** Singleton request queue instance */
export let request_queue: RequestQueue;

/** Configuration options for superfetch */
export interface SuperfetchOptions {
	/** Maximum concurrent requests */
	concurrency?: number;

	/** Maximum retry attempts */
	retries?: number;

	/** Base delay between retries in ms */
	retry_delay?: number;
}

/**
 * Fetch JSON with concurrency limit and retry logic
 */
export function superfetch(
	url: string | URL,
	fetch_options?: RequestInit,
	options: SuperfetchOptions = {}
): Promise<Response> {
	const { concurrency = 10, retries = 3, retry_delay = 2000 } = options;

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

const HEADERS = { 'User-Agent': 'svelte.dev/registry; v1' };

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

/** Normalized package data from npm registry */
interface NormalizedPackageData {
	name: string;
	description?: string;
	homepage?: string;
	keywords: string[];
	repository?: string;
	time: {
		created: string;
		modified: string;
	};
}

/** Result of npm registry validation */
type ValidationResult =
	| { success: true; data: NormalizedPackageData }
	| { success: false; error: string };

/**
 * Validates that the input data matches the expected NPM registry schema format
 */
function validate_npm_registry(data: unknown): ValidationResult {
	try {
		// Check if data is an object
		if (!data || typeof data !== 'object' || Array.isArray(data)) {
			throw new Error('Input must be an object');
		}

		// Create a new object to hold normalized data
		const normalized: NormalizedPackageData = {
			name: '',
			keywords: [],
			time: {
				created: '',
				modified: ''
			}
		};

		const data_obj = data as Record<string, any>;

		// Validate required string: name
		if (!('name' in data_obj)) {
			throw new Error('name is required');
		}
		if (typeof data_obj.name !== 'string' || data_obj.name.trim() === '') {
			throw new Error('name must be a non-empty string');
		}
		normalized.name = data_obj.name;

		// Validate optional string: description
		if ('description' in data_obj) {
			if (typeof data_obj.description !== 'string') {
				throw new Error('description must be a string');
			}
			normalized.description = data_obj.description;
		}

		// Validate optional URL: homepage
		if ('homepage' in data_obj) {
			if (typeof data_obj.homepage !== 'string') {
				throw new Error('homepage must be a string');
			}

			try {
				// Check if valid URL
				new URL(data_obj.homepage);
				normalized.homepage = data_obj.homepage;
			} catch (e) {
				throw new Error('homepage must be a valid URL');
			}
		}

		// Validate array of strings: keywords
		normalized.keywords = [];
		if ('keywords' in data_obj) {
			if (!Array.isArray(data_obj.keywords)) {
				throw new Error('keywords must be an array');
			}

			for (const keyword of data_obj.keywords) {
				if (typeof keyword !== 'string') {
					throw new Error('keywords must contain only strings');
				}
				normalized.keywords.push(keyword);
			}
		}

		// Validate optional repository (string or object with url)
		if ('repository' in data_obj) {
			if (typeof data_obj.repository === 'string') {
				normalized.repository = data_obj.repository;
			} else if (
				typeof data_obj.repository === 'object' &&
				data_obj.repository !== null &&
				'url' in data_obj.repository &&
				typeof data_obj.repository.url === 'string'
			) {
				normalized.repository = data_obj.repository.url;
			} else {
				throw new Error('repository must be a string or an object with a url string');
			}
		}

		// Validate time object with created and modified dates
		if (!('time' in data_obj)) {
			throw new Error('time is required');
		}

		if (typeof data_obj.time !== 'object' || data_obj.time === null) {
			throw new Error('time must be an object');
		}

		if (!('created' in data_obj.time)) {
			throw new Error('time.created is required');
		}

		if (!('modified' in data_obj.time)) {
			throw new Error('time.modified is required');
		}

		if (typeof data_obj.time.created !== 'string') {
			throw new Error('time.created must be a string');
		}

		if (typeof data_obj.time.modified !== 'string') {
			throw new Error('time.modified must be a string');
		}

		normalized.time = {
			created: data_obj.time.created,
			modified: data_obj.time.modified
		};

		return {
			success: true,
			data: normalized
		};
	} catch (error) {
		return {
			success: false,
			error: (error as Error).message
		};
	}
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
export async function fetch_details_for_package(
	pkg: string
): Promise<NormalizedPackageData | undefined> {
	const registry_data = await superfetch(`${REGISTRY_BASE_URL}${pkg}`, { headers: HEADERS }).then(
		(r) => r.json()
	);
	const result = validate_npm_registry(registry_data);
	if (!result.success) {
		console.error(`Failed to parse metadata for "${pkg}": ${result.error}`);
		return;
	}

	return result.data;
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
	fetch_package_json?: boolean;

	/** The size of each yielded batch */
	batch_size?: number;

	/** Whether to use the cache of markdown files */
	skip_cached?: boolean;
}

const cache = new Map<string, any>();
async function populate_cache() {
	if (cache.size > 0) return;

	const cache_dir = path.resolve(
		path.dirname(fileURLToPath(import.meta.url)),
		'../../src/lib/server/generated/registry'
	);

	const cache_dir_contents = await fsp.readdir(cache_dir);
	for (const dirent of cache_dir_contents) {
		const file_path = path.join(cache_dir, dirent);

		try {
			const stat = await fsp.stat(file_path);
			if (stat.isFile()) {
				const file_contents = await fsp.readFile(file_path, 'utf8');
				const extracted = extract_frontmatter(file_contents);
				if (extracted.metadata.name) {
					cache.set(extracted.metadata.name, extracted);
				}
			}
		} catch {}
	}
}

/**
 * Searches npm for a specific keyword and returns batches of results based on batch_size
 */
export async function* stream_search_by_keywords({
	keywords,
	ranking = 'quality',
	limit = Infinity,
	fetch_package_json = true,
	batch_size = 10,
	skip_cached = false
}: SearchOptions): AsyncGenerator<Map<string, any>> {
	await populate_cache();

	let total_runs = 0;
	let collected_packages = new Map<string, any>();

	for (const keyword of keywords) {
		let page = 0;
		let has_more_results = true;

		while (has_more_results && total_runs < limit) {
			// Fetch a page of results
			const url = new URL(`${REGISTRY_BASE_URL}-/v1/search`);
			url.searchParams.set('text', `keywords:${keyword}`);
			url.searchParams.set('ranking', ranking);
			url.searchParams.set('size', String(PAGE_SIZE));
			url.searchParams.set('from', String(page * PAGE_SIZE));

			console.log(`Fetching page ${page + 1} of results for keyword: ${keyword}`);

			try {
				const results = await superfetch(url.toString(), {
					headers: HEADERS
				}).then((r) => r.json());

				// Break if no more results
				if (!results.objects || results.objects.length === 0) {
					has_more_results = false;
					break;
				}

				// Process each package
				for (const obj of results.objects) {
					if (skip_cached && cache.has(obj.package.name)) continue;

					// Skip if we've reached the limit
					if (total_runs >= limit) break;

					// Fetch package.json if needed
					if (fetch_package_json) {
						try {
							const response = await superfetch(`${REGISTRY_BASE_URL}${obj.package.name}`, {
								headers: HEADERS
							}).then((r) => r.json());

							obj.package.json = response;
							obj.package.json.versions = Object.keys(obj.package.json.versions);
						} catch (err) {
							console.error(`Error fetching package.json for ${obj.package.name}:`, err);
							continue; // Skip this package if we can't get its details
						}
					}

					// Filter unwanted packages
					if (
						obj.package.links?.repository !== 'https://github.com/sveltejs/svelte' ||
						obj.package.links?.repository !== 'https://github.com/sveltejs/kit'
					) {
						// Add to our collection
						collected_packages.set(obj.package.name, obj);

						// Yield when we reach the requested batch size
						if (collected_packages.size >= batch_size) {
							console.log(`Yielding batch of ${collected_packages.size} packages`);
							yield collected_packages;
							collected_packages = new Map(); // Reset collection after yielding
						}
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
