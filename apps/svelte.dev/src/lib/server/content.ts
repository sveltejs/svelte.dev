import { dev } from '$app/environment';
import { read } from '$app/server';
import type { Document } from '@sveltejs/site-kit';
import { create_index } from '@sveltejs/site-kit/server/content';
import { minimatch } from 'minimatch';

const documents = import.meta.glob<string>('../../../content/**/*.md', {
	eager: true,
	query: '?url',
	import: 'default'
});

const assets = import.meta.glob<string>('../../../content/**/+assets/**', {
	eager: true,
	query: '?url',
	import: 'default'
});

export const documentsContent = import.meta.glob<string>('../../../content/**/*.md', {
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

export const packages = Array.from(
	new Set(
		Object.keys(docs.topics)
			.map((topic) => topic.split('/')[1])
			.filter(Boolean)
	)
);

const DOCUMENTATION_NAMES: Record<string, string> = {
	svelte: 'Svelte',
	kit: 'SvelteKit',
	cli: 'Svelte CLI'
};

export function getDocumentationTitle(type: string): string {
	return `This is the developer documentation for ${DOCUMENTATION_NAMES[type]}.`;
}

export function getDocumentationStartTitle(type: string): string {
	return `# Start of ${DOCUMENTATION_NAMES[type]} documentation`;
}

export function filterDocsByPackage(
	allDocs: Record<string, string>,
	type: string
): Record<string, string> {
	const filtered: Record<string, string> = {};

	for (const [path, content] of Object.entries(allDocs)) {
		if (path.toLowerCase().includes(`/docs/${type}/`)) {
			filtered[path] = content;
		}
	}

	return filtered;
}

interface MinimizeOptions {
	removeLegacy: boolean;
	removeNoteBlocks: boolean;
	removeDetailsBlocks: boolean;
	removePlaygroundLinks: boolean;
	removePrettierIgnore: boolean;
	normalizeWhitespace: boolean;
}

const defaultOptions: MinimizeOptions = {
	removeLegacy: false,
	removeNoteBlocks: false,
	removeDetailsBlocks: false,
	removePlaygroundLinks: false,
	removePrettierIgnore: false,
	normalizeWhitespace: false
};

function removeQuoteBlocks(content: string, blockType: string): string {
	return content
		.split('\n')
		.reduce((acc: string[], line: string, index: number, lines: string[]) => {
			// If we find a block (with or without additional text), skip it and all subsequent blockquote lines
			if (line.trim().startsWith(`> [!${blockType}]`)) {
				// Skip all subsequent lines that are part of the blockquote
				let i = index;
				while (i < lines.length && (lines[i].startsWith('>') || lines[i].trim() === '')) {
					i++;
				}
				// Update the index to skip all these lines
				index = i - 1;
				return acc;
			}

			// Only add the line if it's not being skipped
			acc.push(line);
			return acc;
		}, [])
		.join('\n');
}

function minimizeContent(content: string, options?: Partial<MinimizeOptions>): string {
	// Merge with defaults, but only for properties that are defined
	const settings: MinimizeOptions = options ? { ...defaultOptions, ...options } : defaultOptions;

	let minimized = content;

	if (settings.removeLegacy) {
		minimized = removeQuoteBlocks(minimized, 'LEGACY');
	}

	if (settings.removeNoteBlocks) {
		minimized = removeQuoteBlocks(minimized, 'NOTE');
	}

	if (settings.removeDetailsBlocks) {
		minimized = removeQuoteBlocks(minimized, 'DETAILS');
	}

	if (settings.removePlaygroundLinks) {
		// Replace playground URLs with /[link] but keep the original link text
		minimized = minimized.replace(/\[([^\]]+)\]\(\/playground[^)]+\)/g, '[$1](/REMOVED)');
	}

	if (settings.removePrettierIgnore) {
		minimized = minimized
			.split('\n')
			.filter((line) => line.trim() !== '<!-- prettier-ignore -->')
			.join('\n');
	}

	if (settings.normalizeWhitespace) {
		minimized = minimized.replace(/\s+/g, ' ');
	}

	minimized = minimized.trim();

	return minimized;
}

function shouldIncludeFileLlmDocs(filename: string, ignore: string[] = []): boolean {
	const shouldIgnore = ignore.some((pattern) => minimatch(filename, pattern));
	if (shouldIgnore) {
		if (dev) console.log(`❌ Ignored by pattern: ${filename}`);
		return false;
	}

	return true;
}

interface GenerateLlmContentOptions {
	prefix?: string;
	ignore?: string[];
	minimize?: Partial<MinimizeOptions>;
	package?: string;
}

export function generateLlmContent(
	docs: Record<string, string>,
	options: GenerateLlmContentOptions = {}
): string {
	const { prefix, ignore = [], minimize: minimizeOptions, package: pkg } = options;

	let content = '';
	if (prefix) {
		content = `${prefix}\n\n`;
	}

	let currentSection = '';
	const paths = sortDocumentationPaths(Object.keys(docs));

	for (const path of paths) {
		if (!shouldIncludeFileLlmDocs(path, ignore)) continue;

		// If a specific package is provided, only include its docs
		if (pkg) {
			if (!path.includes(`/docs/${pkg}/`)) continue;
		} else {
			// For combined content, only include paths that match any package
			const docType = packages.find((p) => path.includes(`/docs/${p}/`));
			if (!docType) continue;

			const section = getDocumentationStartTitle(docType);
			if (section !== currentSection) {
				if (currentSection) content += '\n';
				content += `${section}\n\n`;
				currentSection = section;
			}
		}

		content += `## ${path.replace('../../../content/', '')}\n\n`;
		const docContent = minimizeOptions ? minimizeContent(docs[path], minimizeOptions) : docs[path];
		content += docContent;
		content += '\n';
	}

	return content;
}

function getDocumentationSectionPriority(path: string): number {
	if (path.includes('/docs/svelte/')) return 0;
	if (path.includes('/docs/kit/')) return 1;
	if (path.includes('/docs/cli/')) return 2;
	return 3;
}

export function sortDocumentationPaths(paths: string[]): string[] {
	return paths.sort((a, b) => {
		// First compare by section priority
		const priorityA = getDocumentationSectionPriority(a);
		const priorityB = getDocumentationSectionPriority(b);
		if (priorityA !== priorityB) return priorityA - priorityB;

		// Get directory paths
		const dirA = a.split('/').slice(0, -1).join('/');
		const dirB = b.split('/').slice(0, -1).join('/');

		// If in the same directory, prioritize index.md
		if (dirA === dirB) {
			if (a.endsWith('index.md')) return -1;
			if (b.endsWith('index.md')) return 1;
			return a.localeCompare(b);
		}

		// Otherwise sort by directory path
		return dirA.localeCompare(dirB);
	});
}
