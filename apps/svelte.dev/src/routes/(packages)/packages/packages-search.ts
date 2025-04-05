import type { Package, PackageGroup } from '$lib/server/content';
import flexsearch, { type Index as FlexSearchIndex } from 'flexsearch';

// @ts-expect-error
const Index = (flexsearch.Index as FlexSearchIndex) ?? flexsearch;

/** If the search is already initialized */
export let is_inited = false;

export const REGISTRY_PAGE_LIMIT = 100;

let index: FlexSearchIndex;

const packages_map = new Map<string, Package>();

const name_to_index_map = new Map<string, number>();
let next_id = 0;

// Sorting direction
export type SortDirection = 'asc' | 'dsc';

// Scoring factors
const EXACT_NAME_MATCH_BOOST = 10;
const TAG_MATCH_BOOST = 5;
const NAME_MATCH_BOOST = 3;
const DEPENDENTS_BOOST = 1.5; // Highest weight for packages others depend on
const GITHUB_STARS_BOOST = 5.5; // Medium weight for GitHub stars (between dependents and downloads)
const DOWNLOADS_BOOST = 1.2; // Lower weight for NPM downloads
const RECENT_UPDATE_BOOST = 0.2;
const SVELTE_5_BOOST = 15;

const OUTDATED_PENALTY = -6; // Substantial penalty for outdated packages
const DEPRECATED_PENALTY = -12; // Severe penalty for deprecated packages

/**
 * Simple utility to strip HTML tags from text
 */
function strip_html(html: string): string {
	return html.replace(/<\/?[^>]+(>|$)/g, '');
}

interface SearchEntry {
	package: Package;
	score: number;
}

/**
 * Initialize the search index
 */
export function init(packages: Package[]) {
	if (is_inited) return;

	// @ts-expect-error
	index = new Index({
		tokenize: 'forward'
	});

	for (const pkg of packages) {
		// Create a numeric ID for the package (better for flexsearch performance)
		const id = next_id++;
		name_to_index_map.set(pkg.name, id);

		// Store the original package
		packages_map.set(pkg.name, pkg);

		// Add to search index with processed content
		// Format: index.add(id, text)
		const searchable_text = [
			pkg.name,
			strip_html(pkg.description || ''),
			(pkg.tags || []).join(' '),
			pkg.authors
				? `${pkg.authors.reduce((a, b) => `${a.includes('author:') ? `author:${a}` : `${a}`} author:${b}`, '')}`
				: '' // Add authors with prefix for targeted searching
		].join(' ');

		index.add(id, searchable_text);
	}

	is_inited = true;
}

/**
 * Sort criteria options for package search results
 */
export type SortCriterion =
	| 'popularity'
	| 'downloads'
	| 'dependents'
	| 'github_stars'
	| 'updated'
	| 'name';

export const search_criteria: SortCriterion[] = [
	'popularity',
	'downloads',
	'dependents',
	'github_stars',
	'updated',
	'name'
];

/**
 * Search for packages matching the query and/or tags, returning a flat list sorted by the specified criterion
 *
 * @param query Search query string, can be null
 * @param options Additional search options
 * @returns Flat array of packages sorted by the selected criterion
 */
export function search(
	query: string | null,
	options: {
		tags?: string[];
		sort_by?: SortCriterion;
		direction?: SortDirection;
		filters?: {
			svelte_5_only?: boolean;
			hide_outdated?: boolean;
		};
	} = {}
): Package[] {
	if (!is_inited) {
		throw new Error('Search index not initialized. Call init() first.');
	}

	const { tags = [], sort_by = 'popularity', direction = 'dsc', filters = {} } = options;
	const { svelte_5_only = false, hide_outdated = false } = filters;

	// Normalize query to empty string if null or undefined
	const normalized_query = query === null || query === undefined ? '' : query;

	const has_query = normalized_query.trim().length > 0;
	const has_tags = tags.length > 0;

	// Get all packages that match the criteria
	let result_packages: Package[] = [];

	// Case 1: No query, no tags - return all packages sorted by selected criterion
	if (!has_query && !has_tags) {
		result_packages = Array.from(packages_map.values()).sort((a, b) =>
			sort_packages(a, b, sort_by)
		);
	}
	// Case 2: Empty query, filter by tags only
	else if (!has_query && has_tags) {
		result_packages = Array.from(packages_map.values())
			.filter((pkg) => tags.some((tag) => pkg.tags && pkg.tags.includes(tag)))
			.sort((a, b) => sort_packages(a, b, sort_by));
	}
	// Case 3 & 4: Has query (and possibly tags)
	else if (has_query) {
		// Search the index
		const result_ids = index.search(normalized_query);

		if (result_ids && result_ids.length > 0) {
			if (sort_by === 'popularity') {
				// For popularity sorting, use our complex scoring system
				// Create regex patterns for scoring
				const escaped_query = normalized_query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
				const exact_match = new RegExp(`^${escaped_query}$`, 'i');
				const name_match = new RegExp(`${escaped_query}`, 'i');
				const tag_match = new RegExp(`\\b${escaped_query}\\b`, 'i');

				const now = new Date();
				const entries: SearchEntry[] = [];

				// Process and score each result
				for (const id of result_ids) {
					const package_name = Array.from(name_to_index_map.entries()).find(
						([_, value]) => value === id
					)?.[0];

					if (!package_name) continue;

					const pkg = packages_map.get(package_name);
					if (!pkg) continue;

					// If we have tag filters, only include packages that match ANY of the tags
					if (has_tags && !tags.some((tag) => pkg.tags && pkg.tags.includes(tag))) {
						continue;
					}

					// Apply Svelte 5 filter if enabled
					if (svelte_5_only && !pkg.svelte5) {
						continue;
					}

					// Apply outdated filter if not showing outdated packages
					if (hide_outdated && pkg.outdated) {
						continue;
					}

					// Base score - all matched results start with the same score
					// and then we'll apply our custom scoring
					let score = 10;

					// Boost exact name matches
					if (exact_match.test(pkg.name)) {
						score += EXACT_NAME_MATCH_BOOST;
					} else if (name_match.test(pkg.name)) {
						score += NAME_MATCH_BOOST;
					}

					// Boost tag matches
					if (pkg.tags && pkg.tags.some((tag) => tag_match.test(tag))) {
						score += TAG_MATCH_BOOST;
					}

					if (pkg.authors?.length) {
						for (const author of pkg.authors) {
							if (exact_match.test(author)) {
								// Boost author matches
								score += EXACT_NAME_MATCH_BOOST; // Same high boost as exact package name
							} else if (name_match.test(author)) {
								score += NAME_MATCH_BOOST;
							}
						}
					}

					// Apply a balanced scoring system with log scales
					const dependents = pkg.dependents || 0;
					const stars = pkg.github_stars || 0;
					const downloads = pkg.downloads || 0;

					// Use logarithmic scales to prevent small numbers from dominating
					// Each metric gets its own weighted contribution
					score += Math.log10(dependents + 1) * 10 * DEPENDENTS_BOOST;
					score += Math.log10(stars + 1) * 5 * GITHUB_STARS_BOOST;
					score += Math.log10(downloads + 1) * DOWNLOADS_BOOST;

					// If svelte 5, give boost
					if (pkg.svelte5) {
						score *= SVELTE_5_BOOST;
					}

					// Apply penalties for outdated or deprecated packages
					if (pkg.outdated) {
						score += OUTDATED_PENALTY;
					}

					if (pkg.deprecated) {
						score += DEPRECATED_PENALTY;
					}

					// Boost recently updated packages
					if (pkg.updated) {
						const update_date = new Date(pkg.updated);
						const days_since_update =
							(now.getTime() - update_date.getTime()) / (1000 * 60 * 60 * 24);
						// More recent updates get higher boost
						if (days_since_update < 30) {
							// Last month
							score += ((30 - days_since_update) * RECENT_UPDATE_BOOST) / 30;
						}
					}

					entries.push({ package: pkg, score });
				}

				// Sort by score, considering direction
				const sorted_entries = entries.sort((a, b) => {
					const comparison = b.score - a.score;
					return direction === 'asc' ? -comparison : comparison;
				});

				result_packages = sorted_entries.map((entry) => entry.package);
			} else {
				// For other sort criteria, directly extract and sort the packages
				const matched_packages: Package[] = [];

				for (const id of result_ids) {
					const package_name = Array.from(name_to_index_map.entries()).find(
						([_, value]) => value === id
					)?.[0];

					if (!package_name) continue;

					const pkg = packages_map.get(package_name);
					if (!pkg) continue;

					// If we have tag filters, only include packages that match ANY of the tags
					if (has_tags && !tags.some((tag) => pkg.tags && pkg.tags.includes(tag))) {
						continue;
					}

					// Apply Svelte 5 filter if enabled
					if (svelte_5_only && !pkg.svelte5) {
						continue;
					}

					// Apply outdated filter if not showing outdated packages
					if (hide_outdated && pkg.outdated) {
						continue;
					}

					matched_packages.push(pkg);
				}

				// Sort directly by the selected criterion, considering direction
				result_packages = matched_packages.sort((a, b) => sort_packages(a, b, sort_by));
			}
		}
	}

	// Apply filters to results when not using search (cases 1 & 2)
	if (!has_query) {
		// Apply Svelte 5 filter if enabled
		if (svelte_5_only) {
			result_packages = result_packages.filter((pkg) => pkg.svelte5);
		}

		// Apply outdated filter if not showing outdated packages
		if (hide_outdated) {
			result_packages = result_packages.filter((pkg) => !pkg.outdated);
		}

		// Apply sorting after filtering
		result_packages = result_packages.sort((a, b) => sort_packages(a, b, sort_by));
	}

	return result_packages;
}

/**
 * Helper function to sort packages by the specified criterion with optional weights
 * Higher weights will prioritize packages to appear earlier in the sorted list
 *
 * @param a First package to compare
 * @param b Second package to compare
 * @param criterion The sorting criterion to use
 * @param weights Optional record of package name to weight multiplier
 * @returns Comparison result (-1, 0, or 1)
 */
export function sort_packages(
	a: Package,
	b: Package,
	criterion: SortCriterion,
	weights?: Record<string, number>
): number {
	// Apply weights if provided
	const a_weight = weights?.[a.name] || 1;
	const b_weight = weights?.[b.name] || 1;

	// Check for significant weight difference first
	// This ensures packages with higher weights are prioritized
	const weight_diff = a_weight - b_weight;
	if (Math.abs(weight_diff) > 0.1) {
		// Higher weights should come first
		return weight_diff > 0 ? -1 : 1;
	}

	// If weights are similar, use standard sorting criteria
	switch (criterion) {
		case 'popularity':
			// Create a balanced scoring system using logarithmic scales to prevent small numbers from dominating
			const a_dependents = a.dependents || 0;
			const b_dependents = b.dependents || 0;
			const a_stars = a.github_stars || 0;
			const b_stars = b.github_stars || 0;
			const a_downloads = a.downloads || 0;
			const b_downloads = b.downloads || 0;

			// Use log scale with appropriate weights to maintain priority but prevent small values from dominating
			let a_score =
				Math.log10(a_dependents + 1) * 3 +
				Math.log10(a_stars + 1) * 2 +
				Math.log10(a_downloads + 1) * 1;

			let b_score =
				Math.log10(b_dependents + 1) * 3 +
				Math.log10(b_stars + 1) * 2 +
				Math.log10(b_downloads + 1) * 1;

			// Apply penalties for outdated or deprecated packages
			if (a.outdated) a_score += OUTDATED_PENALTY;
			if (a.deprecated) a_score += DEPRECATED_PENALTY;
			if (b.outdated) b_score += OUTDATED_PENALTY;
			if (b.deprecated) b_score += DEPRECATED_PENALTY;

			return b_score - a_score;

		case 'downloads':
			return (b.downloads || 0) - (a.downloads || 0);

		case 'dependents':
			return (b.dependents || 0) - (a.dependents || 0);

		case 'github_stars':
			return (b.github_stars || 0) - (a.github_stars || 0);

		case 'updated':
			// For date-based sorting
			const a_date = a.updated ? new Date(a.updated).getTime() : 0;
			const b_date = b.updated ? new Date(b.updated).getTime() : 0;
			return b_date - a_date;

		case 'name':
			// For name sorting
			return a.name.localeCompare(b.name);

		default:
			// Default to balanced popularity scoring if an invalid criterion is provided
			const a_def = a.dependents || 0;
			const b_def = b.dependents || 0;
			const a_def_stars = a.github_stars || 0;
			const b_def_stars = b.github_stars || 0;
			const a_def_downloads = a.downloads || 0;
			const b_def_downloads = b.downloads || 0;

			// Use log scale with appropriate weights
			let a_def_score =
				Math.log10(a_def + 1) * 1 +
				Math.log10(a_def_stars + 1) * 3 +
				Math.log10(a_def_downloads + 1) * 2;

			let b_def_score =
				Math.log10(b_def + 1) * 1 +
				Math.log10(b_def_stars + 1) * 3 +
				Math.log10(b_def_downloads + 1) * 2;

			// Apply penalties for outdated or deprecated packages
			if (a.outdated) a_def_score += OUTDATED_PENALTY;
			if (a.deprecated) a_def_score += DEPRECATED_PENALTY;
			if (b.outdated) b_def_score += OUTDATED_PENALTY;
			if (b.deprecated) b_def_score += DEPRECATED_PENALTY;

			return b_def_score - a_def_score;
	}
}

/**
 * Groups packages by tags for better organization of results
 *
 * @param packages List of packages to group
 * @returns Grouped packages
 */
export function group_by_tags(packages: Package[]): PackageGroup[] {
	const grouped: Record<string, { tag: string; packages: Package[] }> = {};

	// First pass: assign each package to its primary tag group
	for (const pkg of packages) {
		// Get first tag or use 'uncategorized'
		const primary_tag = pkg.tags && pkg.tags.length > 0 ? pkg.tags[0] : 'uncategorized';

		const group = (grouped[primary_tag] ??= {
			tag: primary_tag,
			packages: []
		});

		group.packages.push(pkg);
	}

	// Convert to final format and sort groups by highest package popularity
	return Object.values(grouped).sort((a, b) => {
		// Calculate balanced popularity scores with logarithmic scaling
		const get_popularity = (pkg: Package) => {
			const dependents = pkg.dependents || 0;
			const stars = pkg.github_stars || 0;
			const downloads = pkg.downloads || 1;

			// Use balanced logarithmic formula with proper weighting
			return (
				Math.log10(dependents + 1) * 1 + Math.log10(stars + 1) * 3 + Math.log10(downloads + 1) * 1
			);
		};

		const max_popularity_a = Math.max(...a.packages.map(get_popularity));
		const max_popularity_b = Math.max(...b.packages.map(get_popularity));

		return max_popularity_b - max_popularity_a;
	});
}

/**
 * Get a package by its name
 */
export function get_package(name: string): Package | undefined {
	return packages_map.get(name);
}

/**
 * Get all packages in the index
 */
export function get_all_packages(): Package[] {
	return Array.from(packages_map.values());
}

/**
 * Get all available tags with package counts
 */
export function get_all_tags(): { tag: string; count: number }[] {
	const tag_counts: Record<string, number> = {};

	for (const pkg of packages_map.values()) {
		if (pkg.tags && pkg.tags.length) {
			for (const tag of pkg.tags) {
				tag_counts[tag] = (tag_counts[tag] || 0) + 1;
			}
		}
	}

	return Object.entries(tag_counts)
		.map(([tag, count]) => ({ tag, count }))
		.sort((a, b) => b.count - a.count);
}

/**
 * Get packages by author
 */
export function get_packages_by_author(
	author: string,
	direction: SortDirection = 'dsc'
): Package[] {
	return Array.from(packages_map.values())
		.filter((pkg) => pkg.authors?.includes(author))
		.sort((a, b) => {
			// Sort with balanced logarithmic scoring
			const a_dependents = a.dependents || 0;
			const b_dependents = b.dependents || 0;
			const a_stars = a.github_stars || 0;
			const b_stars = b.github_stars || 0;
			const a_downloads = a.downloads || 1;
			const b_downloads = b.downloads || 1;

			// Calculate balanced scores using logarithmic scale
			const a_score =
				Math.log10(a_dependents + 1) * 3 +
				Math.log10(a_stars + 1) * 2 +
				Math.log10(a_downloads + 1) * 1;

			const b_score =
				Math.log10(b_dependents + 1) * 3 +
				Math.log10(b_stars + 1) * 2 +
				Math.log10(b_downloads + 1) * 1;

			const comparison = b_score - a_score;
			return direction === 'asc' ? -comparison : comparison;
		});
}
