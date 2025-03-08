import { read } from '$app/server';
import type { Document } from '@sveltejs/site-kit';
import {
	extract_frontmatter,
	markdown_to_plain_text,
	transform
} from '@sveltejs/site-kit/markdown';
import { create_index } from '@sveltejs/site-kit/server/content';
import registry_json from '../registry.json' assert { type: 'json' };

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

const registry_docs = import.meta.glob<string>('../../../src/lib/server/generated/registry/*.md', {
	eager: true,
	query: '?raw',
	import: 'default'
});

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

export const docs = create_docs();

export const examples = index.examples.children;

/**
 * Represents a Svelte package in the registry
 */
export interface Package {
	/** Package name */
	name: string;

	/** Package description (HTML formatted) */
	description?: string;

	/** Repository URL (typically GitHub) */
	repo_url?: string;

	/** Author username */
	author?: string;

	/** Homepage URL */
	homepage?: string;

	/** Weekly download count */
	downloads?: number;

	/** Number of packages depending on this package */
	dependents?: number;

	/** Last update timestamp */
	updated?: string;

	/** Tags for categorizing the package */
	tags?: string[];
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

function create_registry() {
	let output: Package[] = [];

	for (const frontmatter of Object.values(registry_docs)) {
		const json = extract_frontmatter(frontmatter);
		json.metadata.description = markdown_to_plain_text(json.metadata.description || '');

		// @ts-ignore
		json.metadata.tags = json.metadata.tags
			.split('\n')
			.filter(Boolean)
			.map((v) => v.replace('-', '').trim());

		output.push(json.metadata as unknown as Package);
	}

	return output;
}

export const registry = create_registry();
