import flexsearch, { type Index as FlexSearchIndex } from 'flexsearch';
import type { Package, PackageGroup } from '$lib/server/content';

// @ts-expect-error
const Index = (flexsearch.Index as FlexSearchIndex) ?? flexsearch;

/** If the search is already initialized */
export let inited = false;

export const REGISTRY_PAGE_LIMIT = 100;

let index: FlexSearchIndex;

const packagesMap = new Map<string, Package>();

const nameToIndexMap = new Map<string, number>();
let nextId = 0;

// Scoring factors
const EXACT_NAME_MATCH_BOOST = 10;
const TAG_MATCH_BOOST = 5;
const NAME_MATCH_BOOST = 3;
const DEPENDENTS_BOOST = 1.5; // Highest weight for packages others depend on
const GITHUB_STARS_BOOST = 1.2; // Medium weight for GitHub stars (between dependents and downloads)
const DOWNLOADS_BOOST = 1.0; // Lower weight for NPM downloads
const RECENT_UPDATE_BOOST = 0.2;
const OUTDATED_PENALTY = -10; // Substantial penalty for outdated packages
const DEPRECATED_PENALTY = -20; // Severe penalty for deprecated packages

/**
 * Simple utility to strip HTML tags from text
 */
function stripHtml(html: string): string {
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
	if (inited) return;

	// @ts-expect-error
	index = new Index({
		tokenize: 'forward'
	});

	for (const pkg of packages) {
		// Create a numeric ID for the package (better for flexsearch performance)
		const id = nextId++;
		nameToIndexMap.set(pkg.name, id);

		// Store the original package
		packagesMap.set(pkg.name, pkg);

		// Add to search index with processed content
		// Format: index.add(id, text)
		const searchableText = [
			pkg.name,
			stripHtml(pkg.description || ''),
			(pkg.tags || []).join(' '),
			pkg.author ? `author:${pkg.author}` : '' // Add author with prefix for targeted searching
		].join(' ');

		index.add(id, searchableText);
	}

	inited = true;
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
		sortBy?: SortCriterion;
	} = {}
): Package[] {
	if (!inited) {
		throw new Error('Search index not initialized. Call init() first.');
	}

	const { tags = [], sortBy = 'popularity' } = options;

	// Normalize query to empty string if null or undefined
	const normalizedQuery = query === null || query === undefined ? '' : query;

	const hasQuery = normalizedQuery.trim().length > 0;
	const hasTags = tags.length > 0;

	// Get all packages that match the criteria
	let resultPackages: Package[] = [];

	// Case 1: No query, no tags - return all packages sorted by selected criterion
	if (!hasQuery && !hasTags) {
		resultPackages = Array.from(packagesMap.values()).sort((a, b) => sortPackages(a, b, sortBy));
	}
	// Case 2: Empty query, filter by tags only
	else if (!hasQuery && hasTags) {
		resultPackages = Array.from(packagesMap.values())
			.filter((pkg) => tags.some((tag) => pkg.tags && pkg.tags.includes(tag)))
			.sort((a, b) => sortPackages(a, b, sortBy));
	}
	// Case 3 & 4: Has query (and possibly tags)
	else if (hasQuery) {
		// Search the index
		const resultIds = index.search(normalizedQuery);

		if (resultIds && resultIds.length > 0) {
			if (sortBy === 'popularity') {
				// For popularity sorting, use our complex scoring system
				// Create regex patterns for scoring
				const escapedQuery = normalizedQuery.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
				const exactMatch = new RegExp(`^${escapedQuery}$`, 'i');
				const nameMatch = new RegExp(`${escapedQuery}`, 'i');
				const tagMatch = new RegExp(`\\b${escapedQuery}\\b`, 'i');

				const now = new Date();
				const entries: SearchEntry[] = [];

				// Process and score each result
				for (const id of resultIds) {
					const packageName = Array.from(nameToIndexMap.entries()).find(
						([_, value]) => value === id
					)?.[0];

					if (!packageName) continue;

					const pkg = packagesMap.get(packageName);
					if (!pkg) continue;

					// If we have tag filters, only include packages that match ANY of the tags
					if (hasTags && !tags.some((tag) => pkg.tags && pkg.tags.includes(tag))) {
						continue;
					}

					// Base score - all matched results start with the same score
					// and then we'll apply our custom scoring
					let score = 10;

					// Boost exact name matches
					if (exactMatch.test(pkg.name)) {
						score += EXACT_NAME_MATCH_BOOST;
					} else if (nameMatch.test(pkg.name)) {
						score += NAME_MATCH_BOOST;
					}

					// Boost tag matches
					if (pkg.tags && pkg.tags.some((tag) => tagMatch.test(tag))) {
						score += TAG_MATCH_BOOST;
					}

					// Boost author matches
					if (pkg.author && exactMatch.test(pkg.author)) {
						score += EXACT_NAME_MATCH_BOOST; // Same high boost as exact package name
					} else if (pkg.author && nameMatch.test(pkg.author)) {
						score += NAME_MATCH_BOOST;
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

					// Apply penalties for outdated or deprecated packages
					if (pkg.outdated) {
						score += OUTDATED_PENALTY;
					}

					if (pkg.deprecated) {
						score += DEPRECATED_PENALTY;
					}

					// Boost recently updated packages
					if (pkg.updated) {
						const updateDate = new Date(pkg.updated);
						const daysSinceUpdate = (now.getTime() - updateDate.getTime()) / (1000 * 60 * 60 * 24);
						// More recent updates get higher boost
						if (daysSinceUpdate < 30) {
							// Last month
							score += ((30 - daysSinceUpdate) * RECENT_UPDATE_BOOST) / 30;
						}
					}

					entries.push({ package: pkg, score });
				}

				// Sort first by score
				resultPackages = entries.sort((a, b) => b.score - a.score).map((entry) => entry.package);
			} else {
				// For other sort criteria, directly extract and sort the packages
				const matchedPackages: Package[] = [];

				for (const id of resultIds) {
					const packageName = Array.from(nameToIndexMap.entries()).find(
						([_, value]) => value === id
					)?.[0];

					if (!packageName) continue;

					const pkg = packagesMap.get(packageName);
					if (!pkg) continue;

					// If we have tag filters, only include packages that match ANY of the tags
					if (hasTags && !tags.some((tag) => pkg.tags && pkg.tags.includes(tag))) {
						continue;
					}

					matchedPackages.push(pkg);
				}

				// Sort directly by the selected criterion
				resultPackages = matchedPackages.sort((a, b) => sortPackages(a, b, sortBy));
			}
		}
	}

	return resultPackages;
}

/**
 * Helper function to sort packages by the specified criterion
 */
function sortPackages(a: Package, b: Package, criterion: SortCriterion): number {
	switch (criterion) {
		case 'popularity':
			// Create a balanced scoring system using logarithmic scales to prevent small numbers from dominating
			const aDependents = a.dependents || 0;
			const bDependents = b.dependents || 0;
			const aStars = a.github_stars || 0;
			const bStars = b.github_stars || 0;
			const aDownloads = a.downloads || 0;
			const bDownloads = b.downloads || 0;

			// Use log scale with appropriate weights to maintain priority but prevent small values from dominating
			// Log base 10 with +1 to handle zeros, multiplied by importance factor
			let aScore =
				Math.log10(aDependents + 1) * 3 +
				Math.log10(aStars + 1) * 2 +
				Math.log10(aDownloads + 1) * 1;

			let bScore =
				Math.log10(bDependents + 1) * 3 +
				Math.log10(bStars + 1) * 2 +
				Math.log10(bDownloads + 1) * 1;

			// Apply penalties for outdated or deprecated packages
			if (a.outdated) aScore += OUTDATED_PENALTY;
			if (a.deprecated) aScore += DEPRECATED_PENALTY;
			if (b.outdated) bScore += OUTDATED_PENALTY;
			if (b.deprecated) bScore += DEPRECATED_PENALTY;

			return bScore - aScore;

		case 'downloads':
			return (b.downloads || 0) - (a.downloads || 0);

		case 'dependents':
			return (b.dependents || 0) - (a.dependents || 0);

		case 'github_stars':
			return (b.github_stars || 0) - (a.github_stars || 0);

		case 'updated':
			// Sort by most recently updated
			const aDate = a.updated ? new Date(a.updated).getTime() : 0;
			const bDate = b.updated ? new Date(b.updated).getTime() : 0;
			return bDate - aDate;

		case 'name':
			// Sort alphabetically by name
			return a.name.localeCompare(b.name);

		default:
			// Default to balanced popularity scoring if an invalid criterion is provided
			const aDef = a.dependents || 0;
			const bDef = b.dependents || 0;
			const aDefStars = a.github_stars || 0;
			const bDefStars = b.github_stars || 0;
			const aDefDownloads = a.downloads || 0;
			const bDefDownloads = b.downloads || 0;

			// Use log scale with appropriate weights
			let aDefScore =
				Math.log10(aDef + 1) * 3 +
				Math.log10(aDefStars + 1) * 2 +
				Math.log10(aDefDownloads + 1) * 1;

			let bDefScore =
				Math.log10(bDef + 1) * 3 +
				Math.log10(bDefStars + 1) * 2 +
				Math.log10(bDefDownloads + 1) * 1;

			// Apply penalties for outdated or deprecated packages
			if (a.outdated) aDefScore += OUTDATED_PENALTY;
			if (a.deprecated) aDefScore += DEPRECATED_PENALTY;
			if (b.outdated) bDefScore += OUTDATED_PENALTY;
			if (b.deprecated) bDefScore += DEPRECATED_PENALTY;

			return bDefScore - aDefScore;
	}
}

/**
 * Groups packages by tags for better organization of results
 *
 * @param packages List of packages to group
 * @returns Grouped packages
 */
export function groupByTags(packages: Package[]): PackageGroup[] {
	const grouped: Record<string, { tag: string; packages: Package[] }> = {};

	// First pass: assign each package to its primary tag group
	for (const pkg of packages) {
		// Get first tag or use 'uncategorized'
		const primaryTag = pkg.tags && pkg.tags.length > 0 ? pkg.tags[0] : 'uncategorized';

		const group = (grouped[primaryTag] ??= {
			tag: primaryTag,
			packages: []
		});

		group.packages.push(pkg);
	}

	// Convert to final format and sort groups by highest package popularity
	return Object.values(grouped).sort((a, b) => {
		// Calculate balanced popularity scores with logarithmic scaling
		const getPopularity = (pkg: Package) => {
			const dependents = pkg.dependents || 0;
			const stars = pkg.github_stars || 0;
			const downloads = pkg.downloads || 1;

			// Use balanced logarithmic formula with proper weighting
			return (
				Math.log10(dependents + 1) * 3 + Math.log10(stars + 1) * 2 + Math.log10(downloads + 1) * 1
			);
		};

		const maxPopularityA = Math.max(...a.packages.map(getPopularity));
		const maxPopularityB = Math.max(...b.packages.map(getPopularity));

		return maxPopularityB - maxPopularityA;
	});
}

/**
 * Get a package by its name
 */
export function getPackage(name: string): Package | undefined {
	return packagesMap.get(name);
}

/**
 * Get all packages in the index
 */
export function getAllPackages(): Package[] {
	return Array.from(packagesMap.values());
}

/**
 * Get all available tags with package counts
 */
export function getAllTags(): { tag: string; count: number }[] {
	const tagCounts: Record<string, number> = {};

	for (const pkg of packagesMap.values()) {
		if (pkg.tags && pkg.tags.length) {
			for (const tag of pkg.tags) {
				tagCounts[tag] = (tagCounts[tag] || 0) + 1;
			}
		}
	}

	return Object.entries(tagCounts)
		.map(([tag, count]) => ({ tag, count }))
		.sort((a, b) => b.count - a.count);
}

/**
 * Get packages by author
 */
export function getPackagesByAuthor(author: string): Package[] {
	return Array.from(packagesMap.values())
		.filter((pkg) => pkg.author === author)
		.sort((a, b) => {
			// Sort with balanced logarithmic scoring
			const aDependents = a.dependents || 0;
			const bDependents = b.dependents || 0;
			const aStars = a.github_stars || 0;
			const bStars = b.github_stars || 0;
			const aDownloads = a.downloads || 1;
			const bDownloads = b.downloads || 1;

			// Calculate balanced scores using logarithmic scale
			const aScore =
				Math.log10(aDependents + 1) * 3 +
				Math.log10(aStars + 1) * 2 +
				Math.log10(aDownloads + 1) * 1;

			const bScore =
				Math.log10(bDependents + 1) * 3 +
				Math.log10(bStars + 1) * 2 +
				Math.log10(bDownloads + 1) * 1;

			return bScore - aScore;
		});
}
