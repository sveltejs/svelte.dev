import { api_url } from '#lib/apps.js';
import { error } from '@sveltejs/kit';
import type { Examples } from '../api/examples/all.json/+server.js';

export async function load({ fetch, params }) {
	const examples_res = fetch('/playground/api/examples/all.json').then((r) => r.json());
	const url = api_url(params.id);
	if (!url) error(404);

	// a private atproto app is readable through the owner's cookie
	const res = await fetch(url);

	if (!res.ok) {
		error(res.status);
	}

	const [gist, examples] = await Promise.all([res.json(), examples_res as Promise<Examples>]);

	return {
		gist,
		examples: examples
			.filter((section) => !section.title.includes('Embeds'))
			.map((section) => ({
				title: section.title,
				examples: section.examples.map((example) => ({
					title: example.title,
					slug: example.slug
				}))
			}))
	};
}
