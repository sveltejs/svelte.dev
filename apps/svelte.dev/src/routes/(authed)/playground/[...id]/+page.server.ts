import { error } from '@sveltejs/kit';
import type { Examples } from '../api/examples/all.json/+server.js';

export async function load({ fetch, params }) {
	const examples_res = fetch('/playground/api/examples/all.json').then((r) => r.json());
	// atproto ids are `<handle>/<rkey>`; a private app is readable through the owner's cookie
	const res = await fetch(
		params.id.includes('/')
			? `/playground/api/at/${params.id}`
			: `/playground/api/${params.id}.json`
	);

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
