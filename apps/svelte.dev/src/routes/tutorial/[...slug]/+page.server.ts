import { redirect } from '@sveltejs/kit';
import { load_exercise } from './content.server';
import { get_related_links } from '#lib/server/content.ts';

const aliases: Record<string, string> = {
	'kit/env-static-private': 'kit/env-private',
	'kit/env-dynamic-private': 'kit/env-private',
	'kit/env-static-public': 'kit/env-public',
	'kit/env-dynamic-public': 'kit/env-public',
	'kit/invalidate-all': 'kit/refresh-all'
};

export async function load({ url, params }) {
	if (!params.slug || params.slug === 'svelte') redirect(307, '/tutorial/svelte/welcome-to-svelte');
	if (params.slug === 'kit') redirect(307, '/tutorial/kit/introducing-sveltekit');
	if (!params.slug.includes('/')) redirect(307, `/tutorial/svelte/${params.slug}`);

	const alias = aliases[params.slug];
	if (alias) redirect(308, `/tutorial/${alias}`);

	return {
		exercise: await load_exercise(params.slug),
		related: get_related_links(url.pathname)
	};
}

export function entries() {
	// These are not findable by the router, but we need to know about them for redirects
	return [
		// So that redirects from these URLs to /tutorial/<svelte/kit>/... work
		{ slug: 'svelte' },
		{ slug: 'kit' },
		// So that /tutorial/ redirects to /tutorial
		{ slug: '' },
		...Object.keys(aliases).map((slug) => ({ slug }))
	];
}
