import type { Package, PackageGroup } from '$lib/server/content';

/** If the search is already initialized */
export let is_inited = false;

export const REGISTRY_PAGE_LIMIT = 50;

// Store packages for quick access
const packages_map = new Map<string, Package>();

// Scoring factors
const EXACT_NAME_MATCH_BOOST = 100;
const NAME_INCLUDES_BOOST = 50;
const NAME_WORD_MATCH_BOOST = 30;
const TAG_MATCH_BOOST = 25;
const DESCRIPTION_EXACT_MATCH_BOOST = 20;
const DESCRIPTION_INCLUDES_BOOST = 10;
const AUTHOR_MATCH_BOOST = 15;
const GITHUB_STARS_BOOST = 10;
const DOWNLOADS_BOOST = 4;
const RECENT_UPDATE_BOOST = 1;
const SVELTE_5_BOOST = 15;

const OUTDATED_PENALTY = -100;
const DEPRECATED_PENALTY = -120;

/**
 * Sort criteria options for package search results
 */
export type SortCriterion = 'popularity' | 'downloads' | 'github_stars' | 'updated' | 'name';

export const search_criteria: SortCriterion[] = [
	'popularity',
	'downloads',
	'github_stars',
	'updated',
	'name'
];

// Pre-computed data structures for fast lookup
let tokenized_packages: {
	name_tokens: Map<string, Set<string>>;
	tag_tokens: Map<string, Set<string>>;
	description_tokens: Map<string, Set<string>>;
	author_tokens: Map<string, Set<string>>;
} = {
	name_tokens: new Map(),
	tag_tokens: new Map(),
	description_tokens: new Map(),
	author_tokens: new Map()
};

// Pre-computed popularity scores
const popularity_scores = new Map<string, number>();

// Pre-sorted package lists for common sort criteria
const sorted_packages = {
	popularity: [] as Package[],
	downloads: [] as Package[],
	github_stars: [] as Package[],
	updated: [] as Package[],
	name: [] as Package[]
};

/**
 * Simple utility to strip HTML tags from text
 */
function strip_html(html: string | undefined): string {
	if (!html) return '';
	return html.replace(/<\/?[^>]+(>|$)/g, '');
}

/**
 * Tokenize a string into lowercase words
 */
function tokenize(text: string): Set<string> {
	if (!text) return new Set();

	// Split by non-alphanumeric characters and convert to lowercase
	const tokens = text
		.toLowerCase()
		.split(/[^a-z0-9]+/i)
		.filter((token) => token.length > 1); // Only keep tokens with at least 2 characters

	return new Set(tokens);
}

/**
 * Calculate a popularity score for a package
 */
function calculate_popularity_score(pkg: Package): number {
	const stars = pkg.github_stars || 0;
	const downloads = pkg.downloads || 0;
	const now = new Date();

	// Base score using logarithmic scales
	let score =
		Math.log10(stars + 1) * GITHUB_STARS_BOOST + Math.log10(downloads + 1) * DOWNLOADS_BOOST;

	// If svelte 5, give boost
	if (pkg.svelte?.[5]) {
		score += SVELTE_5_BOOST;
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
		const days_since_update = (now.getTime() - update_date.getTime()) / (1000 * 60 * 60 * 24);
		if (days_since_update < 30) {
			score += ((30 - days_since_update) * RECENT_UPDATE_BOOST) / 30;
		}
	}

	return score;
}

/**
 * Pre-compute indexes and sorted lists for faster search
 */
function pre_compute_indexes(packages: Package[]) {
	// Clear existing data
	tokenized_packages.name_tokens.clear();
	tokenized_packages.tag_tokens.clear();
	tokenized_packages.description_tokens.clear();
	tokenized_packages.author_tokens.clear();
	popularity_scores.clear();

	// Process each package
	for (const pkg of packages) {
		const pkg_name = pkg.name;

		// Tokenize all searchable fields
		tokenized_packages.name_tokens.set(pkg_name, tokenize(pkg_name));

		if (pkg.tags && pkg.tags.length) {
			tokenized_packages.tag_tokens.set(
				pkg_name,
				new Set(pkg.tags.flatMap((tag) => [...tokenize(tag)]))
			);
		}

		if (pkg.description) {
			tokenized_packages.description_tokens.set(pkg_name, tokenize(strip_html(pkg.description)));
		}

		if (pkg.authors && pkg.authors.length) {
			tokenized_packages.author_tokens.set(
				pkg_name,
				new Set(pkg.authors.flatMap((author) => [...tokenize(author)]))
			);
		}

		// Pre-calculate popularity score
		popularity_scores.set(pkg_name, calculate_popularity_score(pkg));
	}

	// Pre-sort packages by each criterion for quick retrieval
	for (const criterion of search_criteria) {
		sorted_packages[criterion] = [...packages].sort((a, b) => sort_packages(a, b, criterion));
	}
}

/**
 * Initialize the search index
 */
export function init(packages: Package[]) {
	if (is_inited) return;

	packages_map.clear();

	// Store all packages
	for (const pkg of packages) {
		packages_map.set(pkg.name, pkg);
	}

	// Pre-compute indexes for faster search
	pre_compute_indexes(packages);

	is_inited = true;
}

/**
 * Fast exact word match check
 */
function has_exact_word_match(tokens: Set<string> | undefined, query_token: string): boolean {
	if (!tokens) return false;
	return tokens.has(query_token);
}

/**
 * Fast partial match check
 */
function has_partial_match(tokens: Set<string> | undefined, query_token: string): boolean {
	if (!tokens) return false;
	for (const token of tokens) {
		if (token.includes(query_token) || query_token.includes(token)) {
			return true;
		}
	}
	return false;
}

/**
 * Calculate search score for a package based on query (optimized)
 */
function calculate_search_score(pkg_name: string, query_tokens: string[]): number {
	if (!query_tokens.length) return 0;

	let score = 0;
	const pkg_name_lower = pkg_name.toLowerCase();

	// Get pre-tokenized fields
	const name_tokens = tokenized_packages.name_tokens.get(pkg_name);
	const tag_tokens = tokenized_packages.tag_tokens.get(pkg_name);
	const description_tokens = tokenized_packages.description_tokens.get(pkg_name);
	const author_tokens = tokenized_packages.author_tokens.get(pkg_name);

	// Score each token separately
	for (const token of query_tokens) {
		// Skip very short tokens
		if (token.length < 2) continue;

		// Name matching (highest priority)
		if (pkg_name_lower === token) {
			score += EXACT_NAME_MATCH_BOOST;
		} else if (has_exact_word_match(name_tokens, token)) {
			score += NAME_WORD_MATCH_BOOST;
		} else if (pkg_name_lower.includes(token)) {
			score += NAME_INCLUDES_BOOST;
		}

		// Tag matching
		if (has_exact_word_match(tag_tokens, token)) {
			score += TAG_MATCH_BOOST;
		}

		// Description matching
		if (has_exact_word_match(description_tokens, token)) {
			score += DESCRIPTION_EXACT_MATCH_BOOST;
		} else if (has_partial_match(description_tokens, token)) {
			score += DESCRIPTION_INCLUDES_BOOST;
		}

		// Author matching
		if (has_partial_match(author_tokens, token)) {
			score += AUTHOR_MATCH_BOOST;
		}
	}

	return score;
}

/**
 * Search for packages matching the query, returning a list sorted by the specified criterion
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
		throw new Error('Search index not initialized. Call init() first.');
	}

	const { sort_by = 'popularity', filters = {}, weights } = options;

	const { svelte_versions = { 3: true, 4: true, 5: true } } = filters;

	// Fast path: if no query and no filters, return pre-sorted list
	const has_version_filter =
		svelte_versions[3] !== undefined ||
		svelte_versions[4] !== undefined ||
		svelte_versions[5] !== undefined;

	if (!query && !has_version_filter && (!weights || Object.keys(weights).length === 0)) {
		return sorted_packages[sort_by];
	}

	// Normalize query to lowercase tokens
	const normalized_query = query === null || query === undefined ? '' : query.trim().toLowerCase();
	const has_query = normalized_query.length > 0;

	// Split query into tokens once
	const query_tokens = has_query ? normalized_query.split(/\s+/).filter((t) => t.length > 0) : [];

	// Function to check if a package matches the version filters
	const matches_svelte_version = (pkg: Package): boolean => {
		// If no version filter is applied, include all packages
		if (!has_version_filter) return true;

		// If the package doesn't have svelte_range, include it regardless of version filter
		if (!pkg.svelte_range) return true;

		// Otherwise, apply the version filter
		return !!(
			(svelte_versions[3] && pkg.svelte?.[3]) ||
			(svelte_versions[4] && pkg.svelte?.[4]) ||
			(svelte_versions[5] && pkg.svelte?.[5])
		);
	};

	// Start with pre-sorted packages for the selected criterion
	// This provides a performance boost when the filter doesn't exclude many packages
	const base_packages = has_query
		? Array.from(packages_map.values()) // For query searches, we'll sort by score anyway
		: sorted_packages[sort_by];

	// Apply version filters
	let filtered_packages = base_packages.filter((pkg) => matches_svelte_version(pkg));

	// If we have a query, score packages and filter by relevance
	if (has_query) {
		// For short queries, use more efficient approach
		const scored_packages = filtered_packages
			.map((pkg) => {
				const search_score = calculate_search_score(pkg.name, query_tokens);

				// If there's no match, return null to filter it out
				if (search_score <= 0) return null;

				const popularity_score = popularity_scores.get(pkg.name) || 0;

				// Blend search relevance with popularity
				const combined_score = search_score * 0.7 + popularity_score * 0.3;

				// Apply custom weights if provided
				const weight = weights?.[pkg.name] || 1;

				return {
					package: pkg,
					score: combined_score * weight
				};
			})
			.filter(Boolean) // Filter out null results
			.sort((a, b) => b!.score - a!.score);

		return scored_packages.map((item) => item!.package);
	}

	// If no query, just sort by the selected criterion
	return filtered_packages.sort((a, b) => sort_packages(a, b, sort_by, weights));
}

/**
 * Sort packages by the specified criterion
 */
export function sort_packages(
	a: Package,
	b: Package,
	criterion: SortCriterion,
	weights?: Record<string, number>
): number {
	// Apply weights if provided
	if (weights) {
		const a_weight = weights[a.name] || 1;
		const b_weight = weights[b.name] || 1;

		// Check for significant weight difference first
		const weight_diff = a_weight - b_weight;
		if (Math.abs(weight_diff) > 0.1) {
			// Higher weights should come first
			return weight_diff > 0 ? -1 : 1;
		}
	}

	switch (criterion) {
		case 'popularity': {
			// Use pre-computed popularity scores when available
			const a_score = popularity_scores.get(a.name) ?? calculate_popularity_score(a);
			const b_score = popularity_scores.get(b.name) ?? calculate_popularity_score(b);
			return b_score - a_score;
		}

		case 'downloads':
			return (b.downloads || 0) - (a.downloads || 0);

		case 'github_stars':
			return (b.github_stars || 0) - (a.github_stars || 0);

		case 'updated': {
			// Sort by most recently updated
			const a_date = a.updated ? new Date(a.updated).getTime() : 0;
			const b_date = b.updated ? new Date(b.updated).getTime() : 0;
			return b_date - a_date;
		}

		case 'name':
			// Sort alphabetically by name
			return a.name.localeCompare(b.name);

		default: {
			// Default to popularity score for unknown criteria
			const a_score = popularity_scores.get(a.name) ?? calculate_popularity_score(a);
			const b_score = popularity_scores.get(b.name) ?? calculate_popularity_score(b);
			return b_score - a_score;
		}
	}
}

/**
 * Groups packages by tags for better organization of results
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
		// Use pre-computed popularity scores for performance
		const max_popularity_a = Math.max(
			...a.packages.map((pkg) => popularity_scores.get(pkg.name) || 0)
		);
		const max_popularity_b = Math.max(
			...b.packages.map((pkg) => popularity_scores.get(pkg.name) || 0)
		);

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
 * Get packages by a specific author
 */
export function get_packages_by_author(author: string): Package[] {
	// Use a Set to efficiently check for author membership
	const author_lower = author.toLowerCase();

	return Array.from(packages_map.values())
		.filter((pkg) => pkg.authors?.some((a) => a.toLowerCase().includes(author_lower)))
		.sort((a, b) => sort_packages(a, b, 'popularity'));
}
