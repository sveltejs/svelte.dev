import { index } from '$lib/server/content';
import type { Document } from '@sveltejs/site-kit';

export function remove_section_from_slug(slug: string) {
	return slug.replace(/\/[^/]+(\/[^/]+)$/g, '$1');
}

/**
 * Create docs index, which is basically the same structure as the original index
 * but with adjusted slugs: The section part is omitted for cleaner URLs.
 */
function create_docs() {
	let docs: Record<string, Document> = {};

	for (const topic of index.docs.children) {
		const sections = topic.children;
		docs[topic.slug] = { ...topic, children: [] };

		for (const section of sections) {
			const pages = section.children;
			docs[section.slug] = { ...section, children: [] };
			docs[topic.slug].children.push(docs[section.slug]);

			for (const page of pages) {
				const slug = remove_section_from_slug(page.slug);
				docs[slug] = {
					...page,
					slug: remove_section_from_slug(page.slug),
					next: page.next
						? { slug: remove_section_from_slug(page.next.slug), title: page.next.title }
						: null,
					prev: page.prev
						? { slug: remove_section_from_slug(page.prev.slug), title: page.prev.title }
						: null
				};
				docs[section.slug].children.push(docs[slug]);
			}
		}
	}

	return docs;
}

export const docs = create_docs();
