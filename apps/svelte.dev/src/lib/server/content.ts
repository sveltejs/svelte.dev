import { read } from '$app/server';
import { PACKAGES_META } from '$lib/packages-meta';
import type { Document, DocumentSummary } from '@sveltejs/site-kit';
import { create_index } from '@sveltejs/site-kit/server/content';

const documents = import.meta.glob<string>('../../../content/**/*.md', {
	eager: true,
	query: '?url',
	import: 'default'
});

const assets = import.meta.glob<string>(
	['../../../content/**/+assets/**', '../../../content/**/+assets/**/.env'],
	{
		eager: true,
		query: '?url',
		import: 'default'
	}
);

const registry_docs = import.meta.glob<string>(
	'../../../src/lib/server/generated/registry/*.json',
	{
		eager: true,
		query: '?raw',
		import: 'default'
	}
);

// https://github.com/vitejs/vite/issues/17453
export const index = await create_index(documents, assets, '../../../content', read);

const months = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ');

function format_date(date: string) {
	const [y, m, d] = date.split('-');
	return `${months[+m - 1]} ${+d} ${y}`;
}

const now = new Date();
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

export const blog_posts = index.blog.children
	.map((post) => {
		const authors: Array<{ name: string; url: string }> = [];

		if (post.metadata.author) {
			const names: string[] = post.metadata.author.split(/, ?/);
			const urls: string[] = post.metadata.authorURL.split(/, ?/);

			if (names.length !== urls.length) {
				throw new Error(`Mismatched authors and URLs in ${post.file}`);
			}

			authors.push(...names.map((name, i) => ({ name, url: urls[i] })));
		}

		const date = post.metadata.date ?? post.file.split('/').pop()!.slice(0, 10);

		return {
			...post,
			date,
			date_formatted: format_date(date),
			authors,
			pinned: post.metadata.pinnedUntil ? post.metadata.pinnedUntil > today : false
		};
	})
	.sort((a, b) => {
		if (!!a.pinned !== !!b.pinned) {
			return a.pinned ? -1 : 1;
		}

		return a.date < b.date ? 1 : -1;
	});

export function remove_section(slug: string) {
	return slug.replace(/\/[^/]+(\/[^/]+)$/g, '$1');
}

/**
 * Create docs index, which is basically the same structure as the original index
 * but with adjusted slugs (the section part is omitted for cleaner URLs), separated
 * topics/pages and next/prev adjusted so that they don't point to different topics.
 */
function create_docs() {
	let docs: {
		/** The top level entries/packages: svelte/kit/etc. Key is the topic */
		topics: Record<string, Document>;
		/** The docs pages themselves. Key is the topic + page */
		pages: Record<string, Document>;
	} = { topics: {}, pages: {} };

	for (const topic of index.docs.children) {
		const pkg = topic.slug.split('/')[1];
		const sections = topic.children;
		const transformed_topic: Document = (docs.topics[topic.slug] = {
			...topic,
			children: []
		});

		for (const section of sections) {
			const pages = section.children;
			const transformed_section: Document = {
				...section,
				children: []
			};

			transformed_topic.children.push(transformed_section);

			for (const page of pages) {
				const slug = remove_section(page.slug);

				if (Object.hasOwn(docs.pages, slug)) {
					throw new Error(`${docs.pages[slug].file} conflicts with ${page.file}`);
				}

				const transformed_page: Document = (docs.pages[slug] = {
					...page,
					slug,
					next: page.next?.slug.startsWith(`docs/${pkg}/`)
						? { slug: remove_section(page.next.slug), title: page.next.title }
						: null,
					prev: page.prev?.slug.startsWith(`docs/${pkg}/`)
						? { slug: remove_section(page.prev.slug), title: page.prev.title }
						: null
				});

				transformed_section.children.push(transformed_page);
			}
		}
	}

	return docs;
}

export function create_summary(document: Document): DocumentSummary {
	return {
		slug: document.slug,
		metadata: document.metadata,
		children: document.children.map(create_summary)
	};
}

export const docs = create_docs();

export const examples = index.examples.children;

/**
 * Dependency graph node structure for nested representation
 */
export interface PackageDependencyNode {
	name: string;
	version: string;
	dependencies: PackageDependencyNode[];
	isCircular?: boolean;
	circularRefId?: string;
	size?: number;
}

/**
 * Package metadata in a flat structure
 */
export interface FlatPackage {
	name: string; // Package name
	version: string; // Package version
	isCircular?: boolean; // Whether this creates a circular reference
	circularTarget?: number; // ID of target in circular reference
	size?: number; // Package size in bytes (unpacked)
}

/**
 * Flat optimized dependency graph with minimal overhead
 */
export interface FlatDependencyGraph {
	rootIndex: number; // Index of the root package
	packages: FlatPackage[]; // All unique packages (index is the implicit ID)
	dependencies: [number, number][]; // All dependencies as [from, to] pairs
	circular: [number, number][]; // Circular dependencies as [from, to] pairs
}

/**
 * Represents a Svelte package in the registry
 */
export interface Package {
	/** Package name */
	name: string;

	version: string;

	/** Package description (HTML formatted) */
	description?: string;

	/** Repository URL (typically GitHub) */
	repo_url?: string;

	/** Author username */
	authors?: string[];

	/** Homepage URL */
	homepage?: string;

	/** Weekly download count */
	downloads?: number;

	/** Last update timestamp */
	updated: string;

	/** Number of GitHub stars */
	github_stars?: number;

	outdated?: boolean;

	esm: boolean;

	cjs: boolean;

	deprecated?: boolean;

	svelte: {
		3: boolean;
		4: boolean;
		5: boolean;
	};

	/** @deprecated DO NOT USE ON FRONTEND */
	svelte_range?: string;
	/** @deprecated DO NOT USE ON FRONTEND */
	kit_range?: string;
	/** @deprecated DO NOT USE ON FRONTEND */
	last_rune_check_version?: string;

	legacy_svelte: boolean;

	readme: string;

	/** Tags for categorizing the package */
	tags: string[];

	official?: boolean;

	typescript: boolean;

	dependency_tree: FlatDependencyGraph;

	unpacked_size: number;

	downloads_history: [start_date: number, value: number][];
}

/**
 * Represents a group of packages with a common tag
 */
export interface PackageGroup {
	/** Tag name */
	tag: string;

	/** Packages in this group */
	packages: Package[];
}

/**
 * Initial package data structure
 */
export interface PackageData {
	blocks: Package[];
}

/**
 * Checks if a semver range supports Svelte versions 3.x, 4.x, and 5.x
 */
export function supports_svelte_versions(version_range: string): {
	3: boolean;
	4: boolean;
	5: boolean;
} {
	if (!version_range) return { 3: false, 4: false, 5: false };

	// Initialize result object
	const result = { 3: false, 4: false, 5: false };

	// Handle version range with OR operators first before any other processing
	if (version_range.includes('||')) {
		const ranges = version_range.split('||').map((r) => r.trim());

		// Check each range and combine results with OR logic
		for (const range of ranges) {
			const range_result = supports_svelte_versions(range);
			result[3] = result[3] || range_result[3];
			result[4] = result[4] || range_result[4];
			result[5] = result[5] || range_result[5];
		}

		return result;
	}

	// Handle exact version with equals sign
	if (version_range.startsWith('=')) {
		const exact_version = version_range.substring(1);
		return supports_svelte_versions(exact_version);
	}

	// Handle hyphen ranges directly (not part of a complex expression)
	if (version_range.includes(' - ')) {
		// Split by hyphen and trim whitespace
		const parts = version_range.split('-').map((p) => p.trim());
		// Handle "x - y" format correctly
		if (parts.length === 2) {
			const start = parseFloat(parts[0]);
			const end = parseFloat(parts[1]);

			result[3] = start <= 3 && end >= 3;
			result[4] = start <= 4 && end >= 4;
			result[5] = start <= 5 && end >= 5;

			return result;
		}
	}

	// Handle complex version ranges with both upper and lower bounds in the same expression
	// Examples: ">=1.0.0 <=4.9.9", ">=3.0.0 <6.0.0", ">3.0.0-rc.1 <3.1.0"
	if (
		version_range.includes(' ') &&
		(version_range.includes('<') ||
			version_range.includes('<=') ||
			version_range.includes('>=') ||
			version_range.includes('>'))
	) {
		// Process for complex range with multiple constraints
		let includes_version_3 = true;
		let includes_version_4 = true;
		let includes_version_5 = true;

		// Split by spaces to get individual constraints
		const constraints = version_range
			.split(' ')
			.filter(
				(c) => c.startsWith('<') || c.startsWith('<=') || c.startsWith('>') || c.startsWith('>=')
			);

		// If we couldn't parse any valid constraints, return false
		if (constraints.length === 0) {
			return { 3: false, 4: false, 5: false };
		}

		// Special case handling for pre-release specific ranges (e.g., ">3.0.0-rc.1 <3.1.0")
		if (constraints.some((c) => c.includes('-'))) {
			// Identify if this is a narrow range for a specific major version
			let major_version = null;

			for (const constraint of constraints) {
				const match = constraint.match(/[<>=]+\s*(\d+)/);
				if (match) {
					const version = parseInt(match[1]);
					if (major_version === null) {
						major_version = version;
					} else if (major_version !== version) {
						major_version = null; // Different major versions, not a narrow range
						break;
					}
				}
			}

			// If we identified a specific major version for this pre-release constraint
			if (major_version !== null) {
				result[3] = major_version === 3;
				result[4] = major_version === 4;
				result[5] = major_version === 5;
				return result;
			}
		}

		for (const constraint of constraints) {
			if (constraint.startsWith('>=')) {
				const version_number = parseFloat(constraint.substring(2));
				// Check lower bounds for each version
				if (version_number > 3) includes_version_3 = false;
				if (version_number > 4) includes_version_4 = false;
				if (version_number > 5) includes_version_5 = false;
			} else if (constraint.startsWith('>')) {
				const version_number = parseFloat(constraint.substring(1));
				// Check lower bounds for each version
				if (version_number >= 3) includes_version_3 = false;
				if (version_number >= 4) includes_version_4 = false;
				if (version_number >= 5) includes_version_5 = false;
			} else if (constraint.startsWith('<=')) {
				const version_number = parseFloat(constraint.substring(2));
				// Check upper bounds for each version
				if (version_number < 3) includes_version_3 = false;
				if (version_number < 4) includes_version_4 = false;
				if (version_number < 5) includes_version_5 = false;
			} else if (constraint.startsWith('<')) {
				const version_number = parseFloat(constraint.substring(1));
				// Check upper bounds for each version
				if (version_number <= 3) includes_version_3 = false;
				if (version_number <= 4) includes_version_4 = false;
				if (version_number <= 5) includes_version_5 = false;
			}
		}

		result[3] = includes_version_3;
		result[4] = includes_version_4;
		result[5] = includes_version_5;

		return result;
	}

	// Handle exact major version format
	if (/^[0-9]+$/.test(version_range)) {
		const version = parseInt(version_range);
		result[3] = version === 3;
		result[4] = version === 4;
		result[5] = version === 5;
		return result;
	}

	// Handle caret ranges
	if (version_range.startsWith('^')) {
		const major_version = parseInt(version_range.substring(1).split('.')[0]);
		result[3] = major_version === 3;
		result[4] = major_version === 4;
		result[5] = major_version === 5;
		return result;
	}

	// Handle pre-release versions directly (e.g., 5.0.0-next.42)
	if (/^([0-9]+)\.([0-9]+)\.([0-9]+)-/.test(version_range)) {
		const match = version_range.match(/^([0-9]+)\./);
		if (match) {
			// Extract major version from the pre-release
			const major_version = parseInt(match[1]);
			result[3] = major_version === 3;
			result[4] = major_version === 4;
			result[5] = major_version === 5;
			return result;
		}
	}

	// Handle tilde ranges
	if (version_range.startsWith('~')) {
		const major_version = parseInt(version_range.substring(1).split('.')[0]);
		result[3] = major_version === 3;
		result[4] = major_version === 4;
		result[5] = major_version === 5;
		return result;
	}

	// Handle wildcard (*) by itself, which means any version
	if (version_range === '*') {
		return { 3: true, 4: true, 5: true };
	}

	// Handle * and x ranges (e.g., "3.x", "4.*")
	if (/^([0-9]+)\.(x|\*)/.test(version_range)) {
		const match = version_range.match(/^([0-9]+)\./);
		if (match) {
			const major_version = parseInt(match[1]);
			result[3] = major_version === 3;
			result[4] = major_version === 4;
			result[5] = major_version === 5;
			return result;
		}
	}

	// Handle >= ranges
	if (version_range.startsWith('>=')) {
		const version_number = parseFloat(version_range.substring(2));
		result[3] = version_number <= 3;
		result[4] = version_number <= 4;
		result[5] = version_number <= 5;
		return result;
	}

	// Handle > ranges
	if (version_range.startsWith('>')) {
		const version_number = parseFloat(version_range.substring(1));
		result[3] = version_number < 3;
		result[4] = version_number < 4;
		result[5] = version_number < 5;
		return result;
	}

	// Handle <= ranges
	if (version_range.startsWith('<=')) {
		const version_number = parseFloat(version_range.substring(2));
		result[3] = version_number >= 3;
		result[4] = version_number >= 4;
		result[5] = version_number >= 5;
		return result;
	}

	// Handle < ranges
	if (version_range.startsWith('<')) {
		const version_number = parseFloat(version_range.substring(1));
		result[3] = version_number > 3;
		result[4] = version_number > 4;
		result[5] = version_number > 5;
		return result;
	}

	// Handle exact versions (like 3.0.0, 4.1.2, etc.)
	if (/^[0-9]+\.[0-9]+\.[0-9]+$/.test(version_range)) {
		const major_version = parseInt(version_range.split('.')[0]);
		result[3] = major_version === 3;
		result[4] = major_version === 4;
		result[5] = major_version === 5;
		return result;
	}

	// Handle x-ranges (3.x.x, 4.x, etc.)
	if (version_range.includes('.x') || version_range.includes('.*')) {
		const major_version = parseInt(version_range.split('.')[0]);
		result[3] = major_version === 3;
		result[4] = major_version === 4;
		result[5] = major_version === 5;
		return result;
	}

	return result;
}

function create_registry() {
	let output: Package[] = [];

	for (const frontmatter of Object.values(registry_docs)) {
		const json = JSON.parse(frontmatter);
		json.official = PACKAGES_META.is_official(json.name);
		json.svelte = supports_svelte_versions(json.svelte_range);

		output.push(json);
	}

	return output;
}

export type MiniPackage = Pick<
	Package,
	'name' | 'description' | 'version' | 'updated' | 'official' | 'github_stars' | 'svelte'
> & {
	downloads: number;
};

export function mini_searchable_data(pkg: Package): MiniPackage {
	const { name, description, version, updated, official, github_stars, downloads_history, svelte } =
		pkg;

	return {
		name,
		description,
		version,
		updated,
		official,
		github_stars,
		downloads: downloads_history.at(-1)?.[1] ?? 0,
		svelte
	};
}

export const registry = create_registry();
export const mini_registry = registry.map(mini_searchable_data);
