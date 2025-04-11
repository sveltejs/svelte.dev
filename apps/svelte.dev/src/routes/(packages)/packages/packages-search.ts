import type { Package, PackageGroup } from '$lib/server/content';

/** If the search is already initialized */
export let is_inited = false;

export const REGISTRY_PAGE_LIMIT = 50;

// Simple in-memory storage
const packages_list: Package[] = [];
const packages_map = new Map<string, Package>();
const search_criteria = ['popularity', 'downloads', 'github_stars', 'updated', 'name'] as const;
export type SortCriterion = (typeof search_criteria)[number];

// Export search criteria for external use
export { search_criteria };

// Weighting factors for popularity calculation
const GITHUB_STARS_WEIGHT = 3;
const DOWNLOADS_WEIGHT = 1;
const DEPENDENTS_WEIGHT = 2;
const SVELTE_5_BOOST = 20;
const OUTDATED_PENALTY = -100;
const DEPRECATED_PENALTY = -200;

// Pre-sorted lists
const sorted_lists: Record<SortCriterion, Package[]> = {
	popularity: [],
	downloads: [],
	github_stars: [],
	updated: [],
	name: []
};

/**
 * Initialize with package data
 */
export function init(packages: Package[]) {
	if (is_inited) return;

	// Store packages
	packages_list.length = 0;
	packages_map.clear();

	for (const pkg of packages) {
		packages_list.push(pkg);
		packages_map.set(pkg.name, pkg);
	}

	// Pre-sort by each criterion
	for (const criterion of search_criteria) {
		sorted_lists[criterion] = [...packages_list].sort((a, b) => sort_packages(a, b, criterion));
	}

	is_inited = true;
}

/**
 * Calculate a weighted popularity score for a package
 */
function calculate_popularity_score(pkg: Package): number {
	// Use logarithmic scaling to prevent extreme values from dominating
	const stars = Math.log10((pkg.github_stars || 0) + 1) * GITHUB_STARS_WEIGHT;
	const downloads = Math.log10((pkg.downloads || 0) + 1) * DOWNLOADS_WEIGHT;

	// Base score combining multiple factors
	let score = stars + downloads;

	// Add bonus for Svelte 5 support
	if (pkg.svelte?.[5]) {
		score += SVELTE_5_BOOST;
	}

	// Apply penalties
	if (pkg.outdated) {
		score += OUTDATED_PENALTY;
	}

	if (pkg.deprecated) {
		score += DEPRECATED_PENALTY;
	}

	return score;
}

/**
 * Ultra-fast search implementation
 */
export function search(
	query: string | null,
	options: {
		sort_by?: SortCriterion;
		filters?: {
			svelte_versions?: {
				3?: boolean;
				4?: boolean;
				5?: boolean;
			};
		};
		weights?: Record<string, number>;
	} = {}
): Package[] {
	if (!is_inited) {
		throw new Error('Search not initialized');
	}

	const { sort_by = 'popularity', filters = {}, weights } = options;

	const { svelte_versions = { 3: true, 4: true, 5: true } } = filters;

	// Fast path: no query, no version filter, no weights
	const has_version_filter =
		svelte_versions[3] !== undefined ||
		svelte_versions[4] !== undefined ||
		svelte_versions[5] !== undefined;

	const has_weights = weights && Object.keys(weights).length > 0;

	if (!query && !has_version_filter && !has_weights) {
		return sorted_lists[sort_by];
	}

	// Start with pre-sorted list
	let result = [...sorted_lists[sort_by]];

	// Apply version filter if needed
	if (has_version_filter) {
		result = result.filter((pkg) => {
			if (!pkg.svelte_range) return true;

			return (
				(svelte_versions[3] && pkg.svelte?.[3]) ||
				(svelte_versions[4] && pkg.svelte?.[4]) ||
				(svelte_versions[5] && pkg.svelte?.[5])
			);
		});
	}

	// If there's a search query, filter by it
	if (query) {
		const q = query.toLowerCase();
		result = result.filter((pkg) => {
			const name_match = pkg.name.toLowerCase().includes(q);
			const desc_match = pkg.description?.toLowerCase().includes(q);
			const tag_match = pkg.tags?.some((tag) => tag.toLowerCase().includes(q));
			const author_match = pkg.authors?.some((author) => author.toLowerCase().includes(q));

			return name_match || desc_match || tag_match || author_match;
		});
	}

	// Apply weights if provided
	if (has_weights) {
		// Re-sort with weights
		result.sort((a, b) => sort_packages(a, b, sort_by, weights));
	}

	return result;
}

/**
 * Utility sort function
 */
export function sort_packages(
	a: Package,
	b: Package,
	criterion: SortCriterion,
	weights?: Record<string, number>
): number {
	// Apply package-specific weights if provided
	if (weights) {
		const a_weight = weights[a.name] || 1;
		const b_weight = weights[b.name] || 1;

		// Check for significant weight difference
		const weight_diff = a_weight - b_weight;
		if (Math.abs(weight_diff) > 0.1) {
			// Higher weights should come first
			return weight_diff > 0 ? -1 : 1;
		}
	}

	switch (criterion) {
		case 'popularity': {
			// Use weighted popularity calculation
			const a_score = calculate_popularity_score(a);
			const b_score = calculate_popularity_score(b);
			return b_score - a_score;
		}

		case 'downloads':
			return (b.downloads || 0) - (a.downloads || 0);

		case 'github_stars':
			return (b.github_stars || 0) - (a.github_stars || 0);

		case 'updated': {
			const a_date = a.updated ? new Date(a.updated).getTime() : 0;
			const b_date = b.updated ? new Date(b.updated).getTime() : 0;
			return b_date - a_date;
		}

		case 'name':
			return a.name.localeCompare(b.name);

		default:
			return 0;
	}
}

/**
 * Simple grouping by tags
 */
export function group_by_tags(packages: Package[]): PackageGroup[] {
	const groups: Record<string, PackageGroup> = {};

	for (const pkg of packages) {
		const tag = pkg.tags?.[0] || 'uncategorized';

		if (!groups[tag]) {
			groups[tag] = { tag, packages: [] };
		}

		groups[tag].packages.push(pkg);
	}

	// Sort groups by highest popularity package
	return Object.values(groups).sort((a, b) => {
		const a_max = Math.max(...a.packages.map((pkg) => calculate_popularity_score(pkg)));
		const b_max = Math.max(...b.packages.map((pkg) => calculate_popularity_score(pkg)));
		return b_max - a_max;
	});
}

/**
 * Get a package by name
 */
export function get_package(name: string): Package | undefined {
	return packages_map.get(name);
}

/**
 * Get all packages
 */
export function get_all_packages(): Package[] {
	return packages_list;
}

/**
 * Get all tags with counts
 */
export function get_all_tags(): { tag: string; count: number }[] {
	const counts: Record<string, number> = {};

	for (const pkg of packages_list) {
		if (pkg.tags) {
			for (const tag of pkg.tags) {
				counts[tag] = (counts[tag] || 0) + 1;
			}
		}
	}

	return Object.entries(counts)
		.map(([tag, count]) => ({ tag, count }))
		.sort((a, b) => b.count - a.count);
}

/**
 * Get packages by author
 */
export function get_packages_by_author(author: string): Package[] {
	const lowercased = author.toLowerCase();

	return packages_list
		.filter((pkg) => pkg.authors?.some((a) => a.toLowerCase().includes(lowercased)))
		.sort((a, b) => sort_packages(a, b, 'popularity'));
}
