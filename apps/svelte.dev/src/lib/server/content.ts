import { read } from '$app/server';
import { create_index } from '@sveltejs/site-kit/server/content';

const markdown_modules = import.meta.glob<{ default: string }>('../content/**/*.md', {
	eager: true,
	query: '?url'
});

export const index = await create_index(markdown_modules, read);
