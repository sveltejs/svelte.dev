import type { Package, PackageGroup } from '$lib/server/content';
import { create, insert, search as orama_search, type SearchParams } from '@orama/orama';

/** If the search is already initialized */
export let is_inited = false;

export const REGISTRY_PAGE_LIMIT = 50;

const packages_map = new Map<string, Package>();

// Scoring factors
const EXACT_NAME_MATCH_BOOST = 10;
const TAG_MATCH_BOOST = 5;
const NAME_MATCH_BOOST = 3;
const DEPENDENTS_BOOST = 2; // Highest weight for packages others depend on
const GITHUB_STARS_BOOST = 27; // Medium weight for GitHub stars (between dependents and downloads)
const DOWNLOADS_BOOST = 7.5; // Lower weight for NPM downloads
const RECENT_UPDATE_BOOST = 0.2;
const SVELTE_5_BOOST = 15;

const OUTDATED_PENALTY = -20; // Substantial penalty for outdated packages
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
 * Create an Orama search index with appropriate schema
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
			deprecated: 'boolean',
			outdated: 'boolean',
			svelte_v3: 'boolean',
			svelte_v4: 'boolean',
			svelte_v5: 'boolean',
			runes: 'boolean',
			official: 'boolean',
			all_text: 'string' // Combined field for full-text search
		},
		components: {
			tokenizer: {
				stemming: true
			}
		}
	});
}

let search_db: ReturnType<typeof create_index>;

/**
 * Initialize the search index using Orama
 */
export async function init(packages: Package[]) {
	if (is_inited) return;

	// Create a new Orama database
	search_db = create_index();

	// // Hook to calculate document scores after insertion if needed
	// await afterInsert(search_db, ({ docs }) => {
	// 	// This is where you can pre-calculate scores if needed
	// });

	for (const pkg of packages) {
		// Store the original package
		packages_map.set(pkg.name, pkg);

		// Extract parts from package name for better indexing
		// For "@sveltejs/kit", we want to also index "sveltejs" and "kit"
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

		// Insert the package into Orama
		await insert(search_db, {
			id: pkg.name,
			name: pkg.name,
			name_parts,
			description,
			tags: pkg.tags || [],
			authors: pkg.authors || [],
			dependents: pkg.dependents || 0,
			downloads: pkg.downloads || 0,
			github_stars: pkg.github_stars || 0,
			updated: pkg.updated || '',
			deprecated: !!pkg.deprecated,
			outdated: !!pkg.outdated,
			svelte_v3: !!pkg.svelte?.[3],
			svelte_v4: !!pkg.svelte?.[4],
			svelte_v5: !!pkg.svelte?.[5],
			runes: !!pkg.runes,
			official: !!pkg.official,
			all_text
		});
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
	} = {}
): Promise<Package[]> {
	if (!is_inited) {
		throw new Error('Search index not initialized. Call init() first.');
	}

	const { tags = [], sort_by = 'popularity', filters = {} } = options;

	const { svelte_versions = { 3: true, 4: true, 5: true }, hide_outdated = false } = filters;

	// Normalize query to empty string if null or undefined
	const normalized_query = query === null || query === undefined ? '' : query;

	const has_query = normalized_query.trim().length > 0;
	const has_tags = tags.length > 0;
	const has_version_filter =
		svelte_versions['3'] !== undefined ||
		svelte_versions['4'] !== undefined ||
		svelte_versions['5'] !== undefined;

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

	// Get all packages that match the criteria
	let result_packages: Package[] = [];

	// Case 1: No query, apply filters only
	if (!has_query) {
		const search_config: any = {
			term: '',
			properties: ['name'],
			limit: 1000
		};

		if (Object.keys(where).length > 0) {
			search_config.where = where;
		}

		const results = await orama_search(search_db, search_config);

		// Map results back to original packages
		result_packages = results.hits
			.map((hit) => packages_map.get(hit.document.id))
			.filter(Boolean) as Package[];

		// Sort by selected criterion
		result_packages.sort((a, b) => sort_packages(a, b, sort_by));
	}
	// Case 2: Has query with filters
	else {
		// Prepare search configuration
		const search_config: SearchParams<ReturnType<typeof create_index>> = {
			term: normalized_query,
			properties: ['name', 'name_parts', 'description', 'tags', 'authors', 'all_text'],
			limit: 100,
			boost: {
				name: 1.5,
				name_parts: 2,
				tags: 1.2
			},
			tolerance: 1
		};

		// Add filters if applicable
		if (Object.keys(where).length > 0) {
			search_config.where = where;
		}

		// Search using Orama
		const results = await orama_search(search_db, search_config);

		if (sort_by === 'popularity') {
			// Create scoring function similar to the original
			const entries: SearchEntry[] = [];
			const now = new Date();

			// Create regex patterns for additional scoring
			const escaped_query = normalized_query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
			const exact_match = new RegExp(`^${escaped_query}$`, 'i');
			const name_match = new RegExp(`${escaped_query}`, 'i');
			const tag_match = new RegExp(`\\b${escaped_query}\\b`, 'i');

			for (const hit of results.hits) {
				const pkg_name = hit.document.id;
				const pkg = packages_map.get(pkg_name);

				if (!pkg) continue;

				// Base score from Orama result
				let score = hit.score * 10;

				console.log({ score, name: pkg.name });

				// Apply custom scoring logic
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
							score += EXACT_NAME_MATCH_BOOST;
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
				score += Math.log10(dependents + 1) * DEPENDENTS_BOOST;
				score += Math.log10(stars + 1) * GITHUB_STARS_BOOST;
				score += Math.log10(downloads + 1) * DOWNLOADS_BOOST;

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

				entries.push({ package: pkg, score });
			}

			// Sort by calculated score
			result_packages = entries.sort((a, b) => b.score - a.score).map((entry) => entry.package);
		} else {
			// For other sort criteria, map to packages and sort
			result_packages = results.hits
				.map((hit) => packages_map.get(hit.document.id))
				.filter(Boolean) as Package[];

			// Apply specified sort
			result_packages.sort((a, b) => sort_packages(a, b, sort_by));
		}
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
			// Sort by most recently updated
			const a_date = a.updated ? new Date(a.updated).getTime() : 0;
			const b_date = b.updated ? new Date(b.updated).getTime() : 0;
			return b_date - a_date;

		case 'name':
			// Sort alphabetically by name
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
export async function get_all_tags(): Promise<{ tag: string; count: number }[]> {
	const tag_counts: Record<string, number> = {};

	// Get all unique tags from the database
	const results = await orama_search(search_db, {
		term: '', // Empty search term to get all documents
		properties: ['tags'],
		limit: 100 // High limit to get all documents
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
