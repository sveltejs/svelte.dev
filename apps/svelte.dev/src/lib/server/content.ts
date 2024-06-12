import { read } from '$app/server';
import { create_index } from '@sveltejs/site-kit/server/content';

const documents = import.meta.glob<{ default: string }>('../../../content/**/*.md', {
	eager: true,
	query: '?url'
});

const assets = import.meta.glob<{ default: string }>('../../../content/**/+assets/**', {
	eager: true,
	query: '?url'
});

// https://github.com/vitejs/vite/issues/17453
export const index = await create_index(documents, assets, '../../../content', read);
