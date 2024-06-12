import { read } from '$app/server';
import { create_index } from '@sveltejs/site-kit/server/content';

const markdown_modules = import.meta.glob<{ default: string }>('../../../content/**/*.md', {
	eager: true,
	query: '?url'
});

// https://github.com/vitejs/vite/issues/17453
export const index = await create_index(markdown_modules, '../../../content', read);
