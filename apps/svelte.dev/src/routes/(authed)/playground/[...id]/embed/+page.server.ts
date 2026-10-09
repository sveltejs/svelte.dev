import { api_url } from '#lib/apps.js';
import { error } from '@sveltejs/kit';

export async function load({ fetch, params, url }) {
	const api = api_url(params.id);
	if (!api) error(404);

	const res = await fetch(api);

	if (!res.ok) {
		error(res.status);
	}

	const gist = await res.json();

	return {
		gist,
		version: url.searchParams.get('version') || 'next'
	};
}
