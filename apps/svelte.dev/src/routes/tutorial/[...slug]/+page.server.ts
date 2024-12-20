import { redirect } from '@sveltejs/kit';
import { load_exercise } from './content.server';

export async function load({ params }) {
	if (!params.slug || params.slug === 'svelte') redirect(307, '/tutorial/svelte/welcome-to-svelte');
	if (params.slug === 'kit') redirect(307, '/tutorial/kit/introducing-sveltekit');
	if (!params.slug.includes('/')) redirect(307, `/tutorial/svelte/${params.slug}`);

	return {
		exercise: await load_exercise(params.slug)
	};
}

export function entries() {
	// These are not findable by the router, but we need to know about them for redirects
	return [
		// So that redirects from these URLs to /tutorial/<svelte/kit>/... work
		{ slug: 'svelte' },
		{ slug: 'kit' },
		// So that /tutorial/ redirects to /tutorial
		{ slug: '' }
	];
}
