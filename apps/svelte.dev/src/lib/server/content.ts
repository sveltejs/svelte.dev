import { read } from '$app/server';
import { create_index } from '@sveltejs/site-kit/server/content';

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

// https://github.com/vitejs/vite/issues/17453
export const index = await create_index(documents, assets, '../../../content', read);

export const blog_posts = index.blog.children
	.map((document) => {
		return {
			slug: document.slug,
			title: document.metadata.title,
			date: document.metadata.date,
			description: document.metadata.description,
			draft: document.metadata.draft
		};
	})
	.sort((a, b) => (a.date < b.date ? 1 : -1));
