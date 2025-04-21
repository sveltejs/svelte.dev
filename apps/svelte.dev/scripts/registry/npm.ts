import * as fsp from 'node:fs/promises';
import path from 'node:path';
import { pipeline } from 'node:stream';
import { fileURLToPath } from 'node:url';
import { createGunzip } from 'node:zlib';
import pacote from 'pacote';
import { format as prettier_format, resolveConfig, type Options } from 'prettier';
import { extract } from 'tar-stream';
import type {
	FlatDependencyGraph,
	FlatPackage,
	Package,
	PackageDependencyNode
} from '../../src/lib/server/content.js';

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

const API_BASE_URL = 'https://api.npmjs.org/';
export const REGISTRY_BASE_URL = 'https://registry.npmjs.org/';

const END_DATE = format_date(new Date());
const START_DATE = format_date(sub_days(new Date(), 7));

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
 * Get the date of the Monday of the current week in UTC
 */
function get_current_week_monday_utc(): Date {
	const now = new Date();
	// Use UTC methods for day calculation
	const day_of_week = now.getUTCDay(); // 0 is Sunday, 1 is Monday, etc.
	const diff = now.getUTCDate() - day_of_week + (day_of_week === 0 ? -6 : 1); // Adjust when day is Sunday

	// Create a new date with the adjusted day
	const monday = new Date(
		Date.UTC(
			now.getUTCFullYear(),
			now.getUTCMonth(),
			diff,
			0,
			0,
			0,
			0 // Set to midnight UTC
		)
	);

	return monday;
}

/**
 * Format date to YYYY-MM-DD format for npm API
 */
function format_date(date: Date): string {
	return date.toISOString().split('T')[0];
}

/**
 * Convert timestamp to day number since Jan 1, 2014
 * Day 0 = Jan 1, 2014 UTC
 */
function timestamp_to_day_number(timestamp: number): number {
	// January 1, 2014 00:00:00 UTC
	const base_date = Date.UTC(2014, 0, 1);
	const days = Math.floor((timestamp - base_date) / (1000 * 60 * 60 * 24));
	return days;
}

/**
 * Group array of daily downloads into weekly totals
 * Each week starts on Monday UTC
 */
function group_into_weekly_totals(
	daily_downloads: { downloads: number; day: string }[]
): [start_date: number, value: number][] {
	const result: [number, number][] = [];

	// Sort downloads by date to ensure proper ordering
	const sorted_downloads = [...daily_downloads].sort(
		(a, b) => new Date(a.day).getTime() - new Date(b.day).getTime()
	);

	// Find the first Monday in the data to properly align weeks
	let current_week_start_index = 0;
	for (let i = 0; i < sorted_downloads.length; i++) {
		const date = new Date(sorted_downloads[i].day + 'T00:00:00Z'); // Ensure UTC
		if (date.getUTCDay() === 1) {
			// Monday is 1
			current_week_start_index = i;
			break;
		}
	}

	// Process each week
	for (let i = current_week_start_index; i < sorted_downloads.length; i += 7) {
		// Get up to 7 days for the current week
		const week_data = sorted_downloads.slice(i, i + 7);

		// Skip incomplete weeks (less than 7 days) at the end
		if (week_data.length < 7) break;

		// Calculate total downloads for the week
		const total_downloads = week_data.reduce((sum, day) => sum + day.downloads, 0);
		if (total_downloads === 0) continue;

		// Calculate week start in UTC
		const week_start_date = new Date(week_data[0].day + 'T00:00:00Z');
		const week_start_timestamp = week_start_date.getTime();

		// Convert to day number
		const start_day = timestamp_to_day_number(week_start_timestamp);

		result.push([start_day, total_downloads]);
	}

	return result;
}

/**
 * Fetches weekly download history for an npm package over the past 104 weeks
 * Optimized to only fetch new data when existing data is provided
 * All dates are in UTC and results use day numbers since Jan 1, 2014
 *
 * @param pkg_name The name of the npm package
 * @param existing_data Optional existing data to check before fetching
 * @returns Array of weekly download data points as tuples [start_day, value]
 */
export async function fetch_package_download_history(
	pkg_name: string,
	existing_data?: [start_date: number, value: number][]
): Promise<[start_date: number, value: number][]> {
	const API_BASE_URL = 'https://api.npmjs.org/';
	const current_monday = get_current_week_monday_utc();
	const WEEKS_TO_KEEP = 104;

	try {
		// Start with a full date range for the API request
		let start_date = new Date(current_monday.getTime());
		start_date.setUTCDate(start_date.getUTCDate() - (WEEKS_TO_KEEP * 7 + 7)); // Add extra days to ensure alignment
		let formatted_start_date = format_date(start_date);
		let end_date = format_date(current_monday);

		// If we have existing data, check if we can optimize the request
		if (existing_data && existing_data.length > 0) {
			// Sort existing data by day number to ensure proper ordering
			const sorted_data = [...existing_data].sort((a, b) => a[0] - b[0]);

			// Convert current Monday to day number for comparison
			const current_monday_day = timestamp_to_day_number(current_monday.getTime());

			// Check if we have the current week in our data
			const has_current_week = sorted_data.some((item) => item[0] === current_monday_day);

			// If we already have current week data, just return the data
			if (has_current_week) {
				return sorted_data.slice(-WEEKS_TO_KEEP);
			}

			// Find the most recent day number we have data for
			let most_recent_day = -Infinity;
			for (const item of sorted_data) {
				if (item[0] > most_recent_day) {
					most_recent_day = item[0];
				}
			}

			// If we have reasonably recent data, we can optimize the fetch
			if (most_recent_day > -Infinity) {
				// Convert day number back to date
				const base_date = Date.UTC(2014, 0, 1);
				const most_recent_date = new Date(base_date + most_recent_day * 24 * 60 * 60 * 1000);

				// Get the week after our most recent data
				const fetch_from_date = new Date(most_recent_date.getTime());
				// Move to next Monday
				fetch_from_date.setUTCDate(fetch_from_date.getUTCDate() + 7);

				// Only fetch from that date if it's before current Monday
				if (fetch_from_date < current_monday) {
					formatted_start_date = format_date(fetch_from_date);
				}
			}
		}

		// Call the npm API for the required range
		const url = `${API_BASE_URL}downloads/range/${formatted_start_date}:${end_date}/${pkg_name}`;

		const response = await superfetch(url, {
			headers: HEADERS
		});

		if (!response.ok) {
			console.error(`Error fetching download history for ${pkg_name}: ${response.status}`);
			return existing_data || [];
		}

		const data = await response.json();

		// Process the downloads data into weekly totals
		if (data && data.downloads && Array.isArray(data.downloads)) {
			const new_weekly_data = group_into_weekly_totals(data.downloads);

			// If we have existing data, merge it with new data
			if (existing_data && existing_data.length > 0) {
				const sorted_existing = [...existing_data].sort((a, b) => a[0] - b[0]);

				// Use a map to merge data, with start_day as key
				const merged_map = new Map<number, [number, number]>();

				// Add existing data to map
				for (const item of sorted_existing) {
					merged_map.set(item[0], item);
				}

				// Add/overwrite with new data
				for (const item of new_weekly_data) {
					merged_map.set(item[0], item);
				}

				// Convert map back to array and sort by day
				const merged_result = Array.from(merged_map.values()).sort((a, b) => a[0] - b[0]);

				// Return only the last WEEKS_TO_KEEP entries
				return merged_result.slice(-WEEKS_TO_KEEP);
			}

			// If no existing data, just return the new data
			return new_weekly_data.slice(-WEEKS_TO_KEEP);
		}

		// If there was a problem with the data, return existing data or empty array
		return existing_data || [];
	} catch (error) {
		console.error(`Error fetching download history for ${pkg_name}:`, error);
		// If we have existing data, return that rather than an empty array on error
		return existing_data || [];
	}
}

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
				typescript: false,
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
				package_json.maintainers?.map((v: any) => v.username) ?? [],
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

// Pattern for rune declarations with proper context
const rune_patterns = [
	// $state declaration
	/\b(?:let|const)\s+\w+\s*=\s*\$state\s*\(/,
	// $derived declaration
	/\b(?:let|const)\s+\w+\s*=\s*\$derived\s*\(/,
	/\b(?:let|const)\s+\w+\s*=\s*\$derived\.by\s*\(/,
	// $effect call
	/\$effect\s*\(/,
	/\$effect\.pre\s*\(/,
	/\$effect\.root\s*\(/,
	/\$effect\.tracking\s*\(/,
	// $props call with support for type annotations
	/\b(?:let|const)\s+(?:{\s*[^}]*}|\w+)(?:\s*:\s*[^=;]+)?\s*=\s*\$props\s*\(/,
	// $bindable call
	/\$bindable\s*\(/,
	// $host call
	/\$host\s*\(/,
	// $inspect call
	/\$inspect\s*\(/,
	/\$inspect\.trace\s*\(/,
	// Classes with runes
	/class\s+\w+\s*{[^}]*\$state\s*\(/,
	// TypeScript-specific destructuring with $props
	/let\s+{\s*[^}]*}\s*:\s*[^=]+\s*=\s*\$props\(\)/
];

/**
 * Determines whether a given piece of Svelte code uses runes.
 *
 * @param text The Svelte code to analyze
 * @returns boolean indicating whether runes are detected
 */
function detect_runes(text: string): boolean {
	// Remove comments to avoid false positives
	const without_comments = text
		// Remove HTML comments
		.replace(/<!--[\s\S]*?-->/g, '')
		// Remove single-line comments
		.replace(/\/\/.*$/gm, '')
		// Remove multi-line comments
		.replace(/\/\*[\s\S]*?\*\//g, '');

	// Skip analysis for empty text
	if (!without_comments.trim()) {
		return false;
	}

	// Make sure we don't match runes inside string literals
	const code_without_strings = without_comments
		.replace(/'[^']*'/g, "''")
		.replace(/"[^"]*"/g, '""')
		.replace(/`[^`]*`/g, '``');

	// Check for rune patterns in code (not in strings)
	for (const pattern of rune_patterns) {
		if (pattern.test(code_without_strings)) {
			return true;
		}
	}

	// Check for snippet syntax (a strong indicator of runes mode)
	if (/{#snippet\s+\w+\s*\(.*?\)}/.test(code_without_strings)) {
		return true;
	}

	// Check for render tags
	if (/{@render\s+\w+\s*\(.*?\)}/.test(code_without_strings)) {
		return true;
	}

	// Check for event attribute syntax (onclick instead of on:click)
	// This is trickier as it could be regular HTML, so look for patterns like:
	const event_attr_pattern = /<\w+[^>]*\s+on\w+\s*=\s*{[^}>]+}/;
	if (event_attr_pattern.test(code_without_strings)) {
		return true;
	}

	return false;
}

export async function stream_package_tarball(
	name: string,
	version: string,
	cb: (params: { filename: string; content: string; skip: () => void; stop: () => void }) => void
) {
	// Construct npm registry URL (handling scoped packages)
	const registry_url = `https://registry.npmjs.org/${name}/-/${name.split('/').pop()}-${version}.tgz`;

	return new Promise((resolve, reject) => {
		// Create a tar extract instance
		const extracted = extract();

		// Process files in the tarball
		extracted.on('entry', async (header, stream, next) => {
			try {
				let content = '';

				// Use an async iterator to read the stream content
				for await (const chunk of stream) {
					content += chunk.toString();
				}

				cb({
					filename: header.name,
					content,
					skip: () => {
						stream.resume();
						next();
					},
					stop: () => {
						stream.resume();
						resolve(null);
						return;
					}
				});

				// Continue to next file
				next();
			} catch (err) {
				reject(err);
			}
		});

		extracted.on('finish', () => {
			resolve(false);
		});

		extracted.on('error', (err) => {
			reject(err);
		});

		// Fetch the tarball
		superfetch(registry_url)
			.then((response) => {
				if (!response.ok) {
					reject(new Error(`Failed to fetch tarball: ${response.statusText}`));
					return;
				}

				// Set up the streaming pipeline:
				// fetch response stream -> gunzip -> tar-stream
				pipeline(response.body!, createGunzip(), extracted, (err) => {
					if (err) {
						console.error('Pipeline failed:', err);
						reject(err);
					}
				});
			})
			.catch(reject);
	});
}

export async function composite_runes_types_check(name: string, version: string) {
	let has_runes = false;
	let has_types = false;

	await stream_package_tarball(name, version, ({ content, filename, stop }) => {
		if (has_runes && has_types) stop();

		// Check for TypeScript files or declaration files
		if (
			filename.endsWith('.d.ts') ||
			filename.endsWith('.ts') ||
			filename.endsWith('.cts') ||
			filename.endsWith('.mts') ||
			filename.endsWith('.d.mts') ||
			filename.endsWith('.d.cts')
		) {
			has_types = true;
		}

		if (
			!has_runes &&
			(filename.endsWith('.svelte.ts') ||
				filename.endsWith('.svelte.js') ||
				filename.endsWith('.svelte'))
		) {
			// Do the rune check now
			has_runes = detect_runes(content);
		}
	});

	return {
		runes: has_runes,
		types: has_types
	};
}

/**
 * Cache to store already resolved package information
 * Using name@version as keys
 */
const dependency_cache = new Map<string, PackageDependencyNode>();

/**
 * Fetches package info with resolved version directly from npm
 */
async function fetch_package_info(pkg_name: string, semver: string) {
	return await pacote.manifest(`${pkg_name}@${semver}`);
}

/**
 * Build dependency graph for a package with depth limitation
 *
 * @param pkg_name The name of the package
 * @param semver The semver range for the package
 * @param max_depth Maximum recursion depth (default: 10)
 * @param current_depth Current recursion depth (used internally)
 * @param path_stack Current dependency path to detect cycles
 * @returns A dependency graph node
 */
/**
 * Build dependency graph for a package with depth limitation
 * Modified to capture package size information
 */
export async function build_dependency_graph(
	pkg_name: string,
	semver: string = 'latest',
	max_depth: number = 10,
	current_depth: number = 0,
	path_stack: string[] = []
): Promise<PackageDependencyNode> {
	try {
		// Create cache key using name and semver
		const cache_key = `${pkg_name}@${semver}`;

		// Check if this package is already in our current path (circular dependency)
		const circular_index = path_stack.indexOf(cache_key);
		if (circular_index !== -1) {
			// We found a genuine circular reference
			return {
				name: pkg_name,
				version: semver,
				dependencies: [],
				isCircular: true,
				circularRefId: cache_key
			};
		}

		// Check if we already processed this package+version in a different path
		if (dependency_cache.has(cache_key)) {
			return dependency_cache.get(cache_key)!;
		}

		// Track current path by adding this package
		const current_path = [...path_stack, cache_key];

		// Fetch package info with resolved version directly from npm
		const pkg_info = await fetch_package_info(pkg_name, semver);

		if (!pkg_info) {
			// Return a stub node if we couldn't fetch the package
			return {
				name: pkg_name,
				version: semver,
				dependencies: []
			};
		}

		// Use the exact version that npm resolved
		const exact_version = pkg_info.version;
		const exact_key = `${pkg_name}@${exact_version}`;

		// Extract package size if available
		const size = pkg_info.dist?.unpackedSize;

		// Create node for this package
		const node: PackageDependencyNode = {
			name: pkg_name,
			version: exact_version,
			dependencies: [],
			size: size
		};

		// Store in cache immediately to handle circular dependencies
		dependency_cache.set(cache_key, node);
		dependency_cache.set(exact_key, node); // Cache with exact version too

		// Stop recursion if we've reached max depth
		if (current_depth >= max_depth) {
			return node;
		}

		// Get dependencies for this package
		const dependencies = pkg_info.dependencies || {};

		// Process dependencies sequentially
		for (const [dep_name, dep_semver] of Object.entries(dependencies)) {
			try {
				// Process one dependency at a time, passing the current path
				const dep_node = await build_dependency_graph(
					dep_name,
					dep_semver as string,
					max_depth,
					current_depth + 1,
					current_path
				);

				node.dependencies.push(dep_node);
			} catch (err) {
				console.error(`Error processing dependency ${dep_name}@${dep_semver}:`, err);
			}
		}

		return node;
	} catch (error) {
		console.error(`Error in build_dependency_graph for ${pkg_name}@${semver}:`, error);
		return {
			name: pkg_name,
			version: semver,
			dependencies: []
		};
	}
}

/**
 * Build a dependency graph directly from a package.json object
 *
 * @param package_json Raw package.json content
 * @param max_depth Maximum recursion depth
 * @returns A complete dependency graph
 */
export async function build_graph_from_package_json(
	package_json: any,
	max_depth: number = 10
): Promise<PackageDependencyNode> {
	try {
		// Clear the dependency cache for a fresh start
		dependency_cache.clear();

		if (!package_json || typeof package_json !== 'object') {
			throw new Error('Invalid package.json data');
		}

		// Create the root node
		const root_node: PackageDependencyNode = {
			name: package_json.name || 'unknown',
			version: package_json.version || 'unknown',
			size: package_json.dist.unpackedSize,
			dependencies: []
		};

		// If no dependencies, return early
		const dependencies = package_json.dependencies || {};
		if (Object.keys(dependencies).length === 0) {
			return root_node;
		}

		// Process each dependency sequentially
		for (const [dep_name, dep_semver] of Object.entries(dependencies)) {
			try {
				// Start with empty path for each top-level dependency
				const dep_node = await build_dependency_graph(
					dep_name,
					dep_semver as string,
					max_depth,
					1,
					[]
				);

				root_node.dependencies.push(dep_node);
			} catch (error) {
				console.error(`Error processing root dependency ${dep_name}@${dep_semver}:`, error);
				// Continue with other dependencies
			}
		}

		return root_node;
	} catch (error) {
		console.error('Error in build_graph_from_package_json:', error);
		return {
			name: package_json?.name || 'unknown',
			version: package_json?.version || 'unknown',
			dependencies: []
		};
	}
}

/**
 * Converts a dependency graph to a highly optimized flat structure
 * Now including package size information
 */
export function flatten_dependency_graph(graph: PackageDependencyNode): FlatDependencyGraph {
	const packages: FlatPackage[] = [];
	const dependencies: [number, number][] = [];
	const circular: [number, number][] = [];

	// Map to track package indices
	const packageIndices = new Map<string, number>();

	// Get or create index for a package
	function getPackageIndex(node: PackageDependencyNode): number {
		const key = `${node.name}@${node.version}`;
		if (packageIndices.has(key)) {
			return packageIndices.get(key)!;
		}

		// Create new entry
		const index = packages.length;
		packageIndices.set(key, index);

		// Include size information if available
		packages.push({
			name: node.name,
			version: node.version,
			size: node.size
		});

		return index;
	}

	// Process the tree and build flat structures
	function processNode(
		node: PackageDependencyNode,
		parentIndex: number | null = null,
		visited = new Set<string>()
	): number {
		// Create a unique identifier for this node
		const nodeKey = `${node.name}@${node.version}`;

		// Check if we've already visited this node in the current traversal path
		if (visited.has(nodeKey)) {
			// We've found a circular reference
			const index = getPackageIndex(node);

			// If this has a parent, add the dependency
			if (parentIndex !== null) {
				dependencies.push([parentIndex, index]);

				// Mark it as circular if not already marked
				if (!packages[index].isCircular) {
					packages[index].isCircular = true;
					packages[index].circularTarget = index; // Self-reference as fallback

					// Add to circular dependencies
					circular.push([parentIndex, index]);
				}
			}

			// Don't process further to prevent infinite recursion
			return index;
		}

		// Get index for this package
		const index = getPackageIndex(node);

		// If this has a parent, add the dependency
		if (parentIndex !== null) {
			dependencies.push([parentIndex, index]);
		}

		// Handle explicit circular reference
		if (node.isCircular && node.circularRefId) {
			const [targetName, targetVersion] = node.circularRefId.split('@');

			// Create a stub node for the circular target
			let targetNode: PackageDependencyNode = {
				name: targetName,
				version: targetVersion,
				dependencies: []
			};

			// Get the target index
			const targetIndex = getPackageIndex(targetNode);

			// Update package with circular info
			packages[index].isCircular = true;
			packages[index].circularTarget = targetIndex;

			// Add to circular dependencies
			circular.push([index, targetIndex]);

			// For circular references, don't process children
			return index;
		}

		// Add this node to the visited set for this traversal path
		const newVisited = new Set(visited);
		newVisited.add(nodeKey);

		// Process all dependencies
		for (const dep of node.dependencies) {
			processNode(dep, index, newVisited);
		}

		return index;
	}

	// Start processing from root
	const rootIndex = processNode(graph);

	return {
		rootIndex,
		packages,
		dependencies,
		circular
	};
}

/**
 * Reconstructs a nested dependency graph from the flat structure
 * Preserving size information
 */
export function unflatten_dependency_graph(flat: FlatDependencyGraph): PackageDependencyNode {
	// First, create a map of dependencies by source
	const dependencyMap = new Map<number, number[]>();

	for (const [from, to] of flat.dependencies) {
		if (!dependencyMap.has(from)) {
			dependencyMap.set(from, []);
		}
		dependencyMap.get(from)!.push(to);
	}

	// Cache for already built nodes to handle circular references
	const builtNodes = new Map<number, PackageDependencyNode>();

	// Recursively build the tree
	function buildNode(index: number): PackageDependencyNode {
		// If already built, return the cached node
		if (builtNodes.has(index)) {
			return builtNodes.get(index)!;
		}

		const pkg = flat.packages[index];

		// Create the node
		const node: PackageDependencyNode = {
			name: pkg.name,
			version: pkg.version,
			dependencies: [],
			size: pkg.size
		};

		// Cache it immediately to handle circular refs
		builtNodes.set(index, node);

		// Handle circular reference
		if (pkg.isCircular && pkg.circularTarget !== undefined) {
			node.isCircular = true;
			const targetPkg = flat.packages[pkg.circularTarget];
			node.circularRefId = `${targetPkg.name}@${targetPkg.version}`;
			// For circular nodes, we stop here and don't add children
			return node;
		}

		// Add dependencies
		const childIndices = dependencyMap.get(index) || [];
		node.dependencies = childIndices.map((childIndex) => buildNode(childIndex));

		return node;
	}

	// Start building from the root
	return buildNode(flat.rootIndex);
}

/**
 * Calculate the total size of the dependency tree
 */
export function calculate_total_size(graph: FlatDependencyGraph): {
	totalSize: number;
	sizeWithDependencies: Map<number, number>;
} {
	// Create a map of dependencies by source
	const dependencyMap = new Map<number, number[]>();

	for (const [from, to] of graph.dependencies) {
		if (!dependencyMap.has(from)) {
			dependencyMap.set(from, []);
		}
		dependencyMap.get(from)!.push(to);
	}

	// Calculate size including all dependencies
	const sizeWithDependencies = new Map<number, number>();

	function calculatePackageSize(index: number, visited = new Set<number>()): number {
		// Avoid cycles
		if (visited.has(index)) return 0;
		visited.add(index);

		// Get this package's size
		const pkg = graph.packages[index];
		const ownSize = pkg.size || 0;

		// Add sizes of all dependencies
		const children = dependencyMap.get(index) || [];
		let dependenciesSize = 0;

		for (const childIndex of children) {
			dependenciesSize += calculatePackageSize(childIndex, new Set(visited));
		}

		const totalSize = ownSize + dependenciesSize;
		sizeWithDependencies.set(index, totalSize);

		return totalSize;
	}

	// Calculate from root
	const totalSize = calculatePackageSize(graph.rootIndex);

	return { totalSize, sizeWithDependencies };
}

/**
 * Build and flatten a dependency graph in one step
 */
export async function build_flat_dependency_graph(
	pkg_name: string,
	semver: string = 'latest',
	max_depth: number = 10
): Promise<FlatDependencyGraph> {
	const graph = await build_dependency_graph(pkg_name, semver, max_depth);
	return flatten_dependency_graph(graph);
}

/**
 * Build a flat dependency graph from a package.json object
 */
export async function build_flat_graph_from_package_json(
	package_json: any,
	max_depth: number = 10
): Promise<FlatDependencyGraph> {
	const graph = await build_graph_from_package_json(package_json);
	return flatten_dependency_graph(graph);
}

/**
 * Find all circular dependencies in a flat graph
 * Returns them in a readable format
 */
export function find_circular_dependencies(graph: FlatDependencyGraph): {
	from: string;
	fromVersion: string;
	to: string;
	toVersion: string;
}[] {
	return graph.circular.map(([fromIndex, toIndex]) => {
		const fromPkg = graph.packages[fromIndex];
		const toPkg = graph.packages[toIndex];

		return {
			from: fromPkg.name,
			fromVersion: fromPkg.version,
			to: toPkg.name,
			toVersion: toPkg.version
		};
	});
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
		typescript: boolean;
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
