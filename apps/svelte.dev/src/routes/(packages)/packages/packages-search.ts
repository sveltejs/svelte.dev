import type { Package, PackageGroup } from '$lib/server/content';
import { create, insert, search as orama_search, type SearchParams } from '@orama/orama';
import { stopwords as english_stopwords } from '@orama/stopwords/english';

/** If the search is already initialized */
export let is_inited = false;

export const REGISTRY_PAGE_LIMIT = 50;

const packages_map = new Map<string, Package>();

// Scoring factors
const DEPENDENTS_BOOST = 1;
const GITHUB_STARS_BOOST = 10;
const DOWNLOADS_BOOST = 4;
const RECENT_UPDATE_BOOST = 1;
const SVELTE_5_BOOST = 15;
const EXACT_NAME_MATCH_BOOST = 100;

const OUTDATED_PENALTY = -100;
const DEPRECATED_PENALTY = -120;

const EXACT_QUERY_REPLACEMENT_REGEX = /[-[\]{}()*+?.,\\^$|#\s]/g;

/**
 * Simple utility to strip HTML tags from text
 */
function strip_html(html: string): string {
	return html.replace(/<\/?[^>]+(>|$)/g, '');
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

// Tracks the current sort criterion and weights
let current_sort: SortCriterion = 'popularity';
let current_weights: Record<string, number> | undefined;
let use_search_score = false;

/**
 * Create an Orama search index with appropriate schema and custom sorting
 */
function create_index() {
	return create({
		schema: {
			id: 'string',
			name: 'string',
			name_parts: 'string[]',
			description: 'string',
			tags: 'string[]',
			authors: 'string[]',
			dependents: 'number',
			downloads: 'number',
			github_stars: 'number',
			updated: 'string',
			updated_timestamp: 'number',
			deprecated: 'boolean',
			outdated: 'boolean',
			svelte_v3: 'boolean',
			svelte_v4: 'boolean',
			svelte_v5: 'boolean',
			runes: 'boolean',
			official: 'boolean',
			popularity_score: 'number',
			all_text: 'string'
		},
		components: {
			tokenizer: {
				stemming: false,
				stopWords: english_stopwords,
				tokenize(raw, language, prop, withCache) {
					return raw.split(/[\s\-]+/);
				}
			}
		}
		// plugins: [pluginPT15()]
		// Custom sort function that considers search score and custom criteria
	});
}

let search_db: ReturnType<typeof create_index>;

/**
 * Initialize the search index using Orama
 */
export async function init(packages: Package[]) {
	if (is_inited) return;

	// Create a new Orama database with custom sorting
	search_db = await create_index();

	for (const pkg of packages) {
		// Store the original package
		packages_map.set(pkg.name, pkg);

		// Extract parts from package name for better indexing
		const name_parts = pkg.name.split(/[/@\-_.]+/).filter(Boolean);

		// Prepare the description
		const description = strip_html(pkg.description || '');

		// Prepare all searchable text in one field
		const all_text = [
			pkg.name,
			...name_parts,
			description,
			(pkg.tags || []).join(' '),
			(pkg.authors || []).join(' ')
		].join(' ');

		// Pre-calculate popularity score
		const popularity_score = calculate_popularity_score(pkg);

		// Convert updated date to timestamp for sorting
		const updated_timestamp = pkg.updated ? new Date(pkg.updated).getTime() : 0;

		// Insert the package into Orama
		await insert(search_db, {
			id: pkg.name,
			name: pkg.name,
			name_parts,
			description,
			tags: pkg.tags || [],
			authors: pkg.authors || [],
			downloads: pkg.downloads || 0,
			github_stars: pkg.github_stars || 0,
			updated: pkg.updated || '',
			updated_timestamp,
			deprecated: !!pkg.deprecated,
			outdated: !!pkg.outdated,
			svelte_v3: !!pkg.svelte?.[3],
			svelte_v4: !!pkg.svelte?.[4],
			svelte_v5: !!pkg.svelte?.[5],
			runes: !!pkg.runes,
			official: !!pkg.official,
			popularity_score,
			all_text
		});
	}

	is_inited = true;
}

/**
 * Search for packages matching the query and/or tags, returning a flat list sorted by the specified criterion
 */
export async function search(
	query: string | null,
	options: {
		tags?: string[];
		sort_by?: SortCriterion;
		filters?: {
			svelte_versions?: {
				3?: boolean;
				4?: boolean;
				5?: boolean;
			};
			hide_outdated?: boolean;
		};
		weights?: Record<string, number>;
	} = {}
): Promise<Package[]> {
	if (!is_inited) {
		throw new Error('Search index not initialized. Call init() first.');
	}

	const { tags = [], sort_by = 'popularity', filters = {}, weights } = options;

	const { svelte_versions = { 3: true, 4: true, 5: true }, hide_outdated = false } = filters;

	// Update the current sort criterion and weights for the custom sort function
	current_sort = sort_by;
	current_weights = weights;

	// Normalize query to empty string if null or undefined
	const normalized_query = query === null || query === undefined ? '' : query;

	const has_query = normalized_query.trim().length > 0;
	const has_tags = tags.length > 0;
	const has_version_filter =
		svelte_versions['3'] !== undefined ||
		svelte_versions['4'] !== undefined ||
		svelte_versions['5'] !== undefined;

	// Set flag to use search score in sorting
	use_search_score = has_query;

	// Build the where clause for Orama based on filters
	const where: any = {};

	if (has_tags) {
		where.tags = { in: tags };
	}

	if (hide_outdated) {
		where.outdated = { eq: false };
	}

	if (has_version_filter) {
		// We need at least one version to match
		const version_conditions = [];

		if (svelte_versions['3']) {
			version_conditions.push({ svelte_v3: { eq: true } });
		}

		if (svelte_versions['4']) {
			version_conditions.push({ svelte_v4: { eq: true } });
		}

		if (svelte_versions['5']) {
			version_conditions.push({ svelte_v5: { eq: true } });
		}

		if (version_conditions.length > 0) {
			where.or = version_conditions;
		}
	}

	// Prepare search configuration
	const search_config: SearchParams<ReturnType<typeof create_index>> = {
		limit: 100,
		mode: 'fulltext',
		sortBy: (a, b) => {
			const id_a = a[0];
			const id_b = b[0];
			const score_a = a[1];
			const score_b = b[1];
			const doc_a = a[2];
			const doc_b = b[2];

			// Apply weights if available
			if (current_weights) {
				const a_weight = current_weights[id_a] || 1;
				const b_weight = current_weights[id_b] || 1;

				// Check for significant weight difference first
				const weight_diff = a_weight - b_weight;
				if (Math.abs(weight_diff) > 0.1) {
					// Higher weights should come first
					return weight_diff > 0 ? -1 : 1;
				}
			}

			// If this is a search query with text term, incorporate the search score
			// if (use_search_score) {
			// 	// For significant score differences, prioritize search relevance
			// 	const score_diff = score_b - score_a;
			// 	if (Math.abs(score_diff) > 0.3) {
			// 		return score_diff;
			// 	}
			// }

			// For similar search scores or no search query, use the selected criterion
			switch (current_sort) {
				case 'popularity':
					let popularity_score_a = doc_a.popularity_score as number;
					let popularity_score_b = doc_b.popularity_score as number;

					// For popularity, blend search score with popularity score when applicable
					if (use_search_score) {
						const name_a = doc_a.name as string;
						const name_b = doc_b.name as string;

						// Create regex patterns for scoring
						const escaped_query = query!.replace(EXACT_QUERY_REPLACEMENT_REGEX, '\\$&');
						const exact_match = new RegExp(`^${escaped_query}$`, 'i');

						// Apply exact match boost
						if (exact_match.test(name_a)) {
							popularity_score_a += EXACT_NAME_MATCH_BOOST;
						}

						if (exact_match.test(name_b)) {
							popularity_score_b += EXACT_NAME_MATCH_BOOST;
						}

						// Blend search relevance with popularity (70% popularity, 30% search score)
						return (
							popularity_score_b * 0.5 + score_b * 0.5 - (score_a * 0.5 + popularity_score_a * 0.5)
						);
					}
					return score_b - score_a;
				case 'downloads':
					return (doc_b.downloads as number) - (doc_a.downloads as number);
				case 'github_stars':
					return (doc_b.github_stars as number) - (doc_a.github_stars as number);
				case 'updated':
					return (doc_b.updated_timestamp as number) - (doc_a.updated_timestamp as number);
				case 'name':
					return (doc_a.name as string).localeCompare(doc_b.name as string);
				default:
					return (doc_b.popularity_score as number) - (doc_a.popularity_score as number);
			}
		}
	};

	// Add filters if applicable
	if (Object.keys(where).length > 0) {
		search_config.where = where;
	}

	// Add search term and properties if we have a query
	if (has_query) {
		search_config.term = normalized_query;
		search_config.properties = ['name', 'name_parts', 'description', 'tags', 'authors', 'all_text'];
		search_config.boost = {
			name: 2.0,
			name_parts: 1.5,
			tags: 1.2
		};
	} else {
		// If no query, just do an empty search
		search_config.term = '';
		search_config.properties = ['name'];
	}

	// Search using Orama - the sortBy function will handle sorting
	const results = await orama_search(search_db, search_config);

	// Map results back to original packages
	return results.hits.map((hit) => packages_map.get(hit.document.id)).filter(Boolean) as Package[];
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
		// Calculate balanced popularity scores with logarithmic scaling
		const get_popularity = (pkg: Package) => {
			return calculate_popularity_score(pkg);
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
export async function get_all_tags(): Promise<{ tag: string; count: number }[]> {
	const tag_counts: Record<string, number> = {};

	// Get all unique tags from the database
	const results = await orama_search(search_db, {
		term: '',
		properties: ['tags'],
		limit: 10000
	});

	for (const hit of results.hits) {
		const tags = hit.document.tags || [];
		for (const tag of tags) {
			tag_counts[tag] = (tag_counts[tag] || 0) + 1;
		}
	}

	return Object.entries(tag_counts)
		.map(([tag, count]) => ({ tag, count }))
		.sort((a, b) => b.count - a.count);
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

	// If weights are similar or not provided, use standard sorting criteria
	switch (criterion) {
		case 'popularity':
			// Use our popularity score calculation function
			const a_score = calculate_popularity_score(a);
			const b_score = calculate_popularity_score(b);
			return b_score - a_score;

		case 'downloads':
			return (b.downloads || 0) - (a.downloads || 0);

		case 'github_stars':
			return (b.github_stars || 0) - (a.github_stars || 0);

		case 'updated':
			// Sort by most recently updated
			const a_date = a.updated ? new Date(a.updated).getTime() : 0;
			const b_date = b.updated ? new Date(b.updated).getTime() : 0;
			return b_date - a_date;

		case 'name':
			// Sort alphabetically by name
			return a.name.localeCompare(b.name);

		default:
			// Default to popularity score for unknown criteria
			const a_def_score = calculate_popularity_score(a);
			const b_def_score = calculate_popularity_score(b);
			return b_def_score - a_def_score;
	}
}
