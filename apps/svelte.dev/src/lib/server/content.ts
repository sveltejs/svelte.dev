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
// we need a separate glob import for document assets because we need to use `read` so it needs the actual import, not `?url`
const documents_assets = import.meta.glob<string>(['../../../content/docs/**/+assets/**'], {
	eager: true,
	import: 'default'
});

const registry_docs = import.meta.glob<string>(
	'../../../src/lib/server/generated/registry/*.json',
	{
		eager: true,
		query: '?raw',
		import: 'default'
	}
);

// https://github.com/vitejs/vite/issues/17453
export const index = await create_index(
	documents,
	assets,
	documents_assets,
	'../../../content',
	read
);

const months = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ');

function format_date(date: string) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
		throw new Error(`Invalid blog post date for date ${date}, should be in the format YYYY-MM-DD`);
	}

	const [y, m, d] = date.split('-');
	const month = months[+m - 1];
	if (month === undefined) {
		throw new Error(`Invalid blog post month for date ${date}`);
	}
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
 * Represents a Svelte package in the registry
 */
export interface Package
	extends PackageKey,
		PackageManual,
		PackageNpm,
		PackageGithub,
		PackageCalculated {}

export interface PackageKey {
	/** Package name */
	name: string;
}

export interface PackageManual {
	description?: string;

	/** sv info */
	svAlias?: string;
	svOptions?: string;
}

export interface PackageDefinition extends PackageKey, PackageManual {}

export interface PackageNpm {
	/** Package description (HTML formatted) */
	npm_description?: string;

	/** Repository URL (typically GitHub) */
	repo_url?: string;

	/** Author username */
	authors?: string[];

	/** Homepage URL */
	homepage?: string;

	/** Latest version */
	version: string;

	/** Why the package is deprecated */
	deprecated_reason: false | string;

	/** Weekly download count */
	downloads?: number;

	/** Last update timestamp */
	updated: string;

	/** Svelte version range */
	svelte_range?: string;

	/** SvelteKit version range */
	kit_range?: string;

	// SHOULD BE CALCULATED WHEN GET FROM NPM
	/** @deprecated */
	typescript?: boolean;
	// SHOULD BE CALCULATED WHEN GET FROM NPM
	/** @deprecated */
	runes?: boolean;
	// SHOULD BE DELETED (in *.json files as well)
	/** @deprecated */
	last_rune_check_version?: string;
}

export interface PackageGithub {
	/** Number of GitHub stars */
	github_stars?: number;
}

export interface PackageCalculated {
	description?: string;
	official?: boolean;
	outdated?: boolean;
	svelte: {
		3: boolean;
		4: boolean;
		5: boolean;
	};
}

export interface Category {
	title: string;
	hash: string;
	description?: string;
	packages: Package[];
}

function create_registry() {
	let output: Package[] = [];

	for (const frontmatter of Object.values(registry_docs)) {
		const json = JSON.parse(frontmatter);

		json.description = PACKAGES_META.calculate_description(json);
		json.homepage = PACKAGES_META.calculate_homepage(json);
		json.official = PACKAGES_META.is_official(json.name);
		json.outdated = PACKAGES_META.is_outdated(json.updated);
		json.svelte = PACKAGES_META.supports_svelte_versions(json.svelte_range);

		output.push(json as unknown as Package);
	}

	return output;
}

export const registry = create_registry();
