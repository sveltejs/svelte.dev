import flexsearch, { type Index as FlexSearchIndex } from 'flexsearch';
import type { Package, PackageGroup } from '$lib/server/content';

// @ts-expect-error
const Index = (flexsearch.Index as FlexSearchIndex) ?? flexsearch;

/** If the search is already initialized */
export let inited = false;

let index: FlexSearchIndex;

const packagesMap = new Map<string, Package>();

const nameToIndexMap = new Map<string, number>();
let nextId = 0;

// Scoring factors
const EXACT_NAME_MATCH_BOOST = 10;
const TAG_MATCH_BOOST = 5;
const NAME_MATCH_BOOST = 3;
const DOWNLOADS_BOOST = 1.0; // Stronger boost for popular packages
const DEPENDENTS_BOOST = 1.5; // Higher weight for packages others depend on
const RECENT_UPDATE_BOOST = 0.2;

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
 * Search for packages matching the query and return a flat list sorted by popularity
 *
 * @param query Search query string
 * @param options Additional search options
 * @returns Flat array of packages sorted by popularity
 */
export function search(
	query: string,
	options: {
		authorFilter?: string;
	} = {}
): Package[] {
	if (!inited) {
		throw new Error('Search index not initialized. Call init() first.');
	}

	if (!query.trim() && !options.authorFilter) {
		return [];
	}

	// Create regex patterns for scoring
	const escapedQuery = query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
	const exactMatch = new RegExp(`^${escapedQuery}$`, 'i');
	const nameMatch = new RegExp(`${escapedQuery}`, 'i');
	const tagMatch = new RegExp(`\\b${escapedQuery}\\b`, 'i');

	// Handle author-specific searching
	let searchQuery = query;
	if (options.authorFilter) {
		// If there's already content in the query, add the author as an additional term
		if (query.trim()) {
			searchQuery = `${query} author:${options.authorFilter}`;
		} else {
			// If query is empty, just search for the author
			searchQuery = `author:${options.authorFilter}`;
		}
	}

	// FlexSearch returns an array of IDs when not using document search mode
	const resultIds = index.search(searchQuery);

	if (!resultIds || !resultIds.length) {
		return [];
	}

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

		// Boost popular packages
		if (pkg.downloads) {
			// Log scale for downloads to avoid domination by very popular packages
			score += Math.log10(pkg.downloads + 1) * DOWNLOADS_BOOST;
		}

		// Boost packages with many dependents
		if (pkg.dependents) {
			// Dependents are weighted more heavily as they indicate package reliability
			score += Math.log10(pkg.dependents + 1) * 10 * DEPENDENTS_BOOST;
		}

		// Combined popularity score (packages with both downloads and dependents are prioritized)
		if (pkg.downloads && pkg.dependents) {
			// Main formula: Downloads × Dependents
			// Using log to prevent extremely popular packages from completely dominating
			const popularityFormula = pkg.downloads * pkg.dependents;
			score += Math.log10(popularityFormula + 1) * 2; // Higher weight for the formula
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

	// Instead of grouping, flatten all entries and sort by popularity
	return entries
		.sort((a, b) => {
			// First sort by score (which already factors in downloads/dependents)
			const scoreDiff = b.score - a.score;
			if (Math.abs(scoreDiff) > 1) return scoreDiff;

			// For close scores, prioritize by direct popularity formula: Downloads × Dependents
			const aFormula = (a.package.downloads || 1) * (a.package.dependents || 1);
			const bFormula = (b.package.downloads || 1) * (b.package.dependents || 1);

			// Sort in descending order (higher values first)
			return bFormula - aFormula;
		})
		.map((entry) => entry.package);
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
		// Sort groups by highest package popularity
		const maxPopularityA = Math.max(
			...a.packages.map((p) => (p.downloads || 1) * (p.dependents || 1))
		);
		const maxPopularityB = Math.max(
			...b.packages.map((p) => (p.downloads || 1) * (p.dependents || 1))
		);
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
 * Get packages by tag
 */
export function getPackagesByTag(tag: string): Package[] {
	return Array.from(packagesMap.values())
		.filter((pkg) => pkg.tags && pkg.tags.includes(tag))
		.sort((a, b) => {
			// Sort by Downloads × Dependents formula
			const aFormula = (a.downloads || 1) * (a.dependents || 1);
			const bFormula = (b.downloads || 1) * (b.dependents || 1);
			return bFormula - aFormula;
		});
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
			// Sort by Downloads × Dependents formula
			const aFormula = (a.downloads || 1) * (a.dependents || 1);
			const bFormula = (b.downloads || 1) * (b.dependents || 1);
			return bFormula - aFormula;
		});
}

/**
 * Calculate the popularity score for a package
 * Uses the Downloads × Dependents formula with fallback handling
 *
 * @param pkg The package to calculate score for
 * @returns The popularity score
 */
export function calculatePopularity(pkg: Package): number {
	const downloads = pkg.downloads || 0;
	const dependents = pkg.dependents || 0;

	// Main formula: Downloads × Dependents
	// If either is 0, we use the other value to avoid nullifying the score completely
	return downloads === 0 ? dependents * 10 : dependents === 0 ? downloads : downloads * dependents;
}

/**
 * Returns the entire registry sorted by popularity (Downloads × Dependents)
 *
 * @param options Optional sort configuration
 * @returns All packages sorted by popularity
 */
export function getSortedRegistry(
	options: {
		limit?: number;
		minDownloads?: number;
		minDependents?: number;
		includeNoStats?: boolean;
	} = {}
): Package[] {
	if (!inited) {
		throw new Error('Search index not initialized. Call init() first.');
	}

	const { limit = Infinity, minDownloads = 0, minDependents = 0, includeNoStats = true } = options;

	// Get all packages
	const allPackages = Array.from(packagesMap.values());

	// Filter packages based on criteria
	const filteredPackages = allPackages.filter((pkg) => {
		const downloads = pkg.downloads || 0;
		const dependents = pkg.dependents || 0;

		// Skip packages with no stats if specified
		if (!includeNoStats && downloads === 0 && dependents === 0) {
			return false;
		}

		// Apply minimum thresholds
		return downloads >= minDownloads && dependents >= minDependents;
	});

	// Sort packages by popularity formula
	const sortedPackages = filteredPackages.sort((a, b) => {
		const popularityA = calculatePopularity(a);
		const popularityB = calculatePopularity(b);

		// Sort in descending order (highest popularity first)
		return popularityB - popularityA;
	});

	// Apply limit if specified
	return sortedPackages.slice(0, limit);
}

/**
 * Returns packages sorted by a specific criteria
 *
 * @param sortBy The sort criterion
 * @param options Optional sort configuration
 * @returns Sorted packages
 */
export function getPackagesSortedBy(
	sortBy: 'downloads' | 'dependents' | 'popularity' | 'updated' | 'name',
	options: {
		limit?: number;
		ascending?: boolean;
	} = {}
): Package[] {
	if (!inited) {
		throw new Error('Search index not initialized. Call init() first.');
	}

	const { limit = Infinity, ascending = false } = options;

	// Get all packages
	const allPackages = Array.from(packagesMap.values());

	// Sort by the specified criterion
	const sortedPackages = allPackages.sort((a, b) => {
		let comparison: number;

		switch (sortBy) {
			case 'downloads':
				comparison = (b.downloads || 0) - (a.downloads || 0);
				break;

			case 'dependents':
				comparison = (b.dependents || 0) - (a.dependents || 0);
				break;

			case 'popularity':
				comparison = calculatePopularity(b) - calculatePopularity(a);
				break;

			case 'updated':
				const dateA = a.updated ? new Date(a.updated).getTime() : 0;
				const dateB = b.updated ? new Date(b.updated).getTime() : 0;
				comparison = dateB - dateA;
				break;

			case 'name':
				comparison = a.name.localeCompare(b.name);
				break;

			default:
				comparison = calculatePopularity(b) - calculatePopularity(a);
		}

		// Apply ascending/descending direction
		return ascending ? -comparison : comparison;
	});

	// Apply limit if specified
	return sortedPackages.slice(0, limit);
}

/**
 * Get statistics about the registry
 *
 * @returns Statistical information about the packages
 */
export function getRegistryStats(): {
	totalPackages: number;
	totalDownloads: number;
	averageDownloads: number;
	totalDependents: number;
	averageDependents: number;
	packagesWithDownloads: number;
	packagesWithDependents: number;
	mostPopularPackages: Package[];
	recentlyUpdatedPackages: Package[];
	tagDistribution: { tag: string; count: number }[];
} {
	if (!inited) {
		throw new Error('Search index not initialized. Call init() first.');
	}

	const allPackages = Array.from(packagesMap.values());

	// Basic counts
	const totalPackages = allPackages.length;

	// Download stats
	const packagesWithDownloads = allPackages.filter((pkg) => (pkg.downloads || 0) > 0).length;
	const totalDownloads = allPackages.reduce((sum, pkg) => sum + (pkg.downloads || 0), 0);
	const averageDownloads = packagesWithDownloads > 0 ? totalDownloads / packagesWithDownloads : 0;

	// Dependent stats
	const packagesWithDependents = allPackages.filter((pkg) => (pkg.dependents || 0) > 0).length;
	const totalDependents = allPackages.reduce((sum, pkg) => sum + (pkg.dependents || 0), 0);
	const averageDependents =
		packagesWithDependents > 0 ? totalDependents / packagesWithDependents : 0;

	// Most popular packages (top 10)
	const mostPopularPackages = getPackagesSortedBy('popularity', { limit: 10 });

	// Recently updated packages (top 10)
	const recentlyUpdatedPackages = getPackagesSortedBy('updated', { limit: 10 });

	// Tag distribution
	const tagDistribution = getAllTags();

	return {
		totalPackages,
		totalDownloads,
		averageDownloads,
		totalDependents,
		averageDependents,
		packagesWithDownloads,
		packagesWithDependents,
		mostPopularPackages,
		recentlyUpdatedPackages,
		tagDistribution
	};
}
