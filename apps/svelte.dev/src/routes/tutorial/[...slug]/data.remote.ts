import { prerender } from '$app/server';
import { redirect } from '@sveltejs/kit';
import { load_exercise, parts } from './content.server';
import * as v from 'valibot';

export const get_index = prerender(() => parts);

export const get_exercise = prerender(v.string(), async (slug) => {
	if (!slug || slug === 'svelte') redirect(307, '/tutorial/svelte/welcome-to-svelte');
	if (slug === 'kit') redirect(307, '/tutorial/kit/introducing-sveltekit');
	if (!slug.includes('/')) redirect(307, `/tutorial/svelte/${slug}`);

	return await load_exercise(slug);
});
