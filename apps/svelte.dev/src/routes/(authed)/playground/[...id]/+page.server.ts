import { error } from '@sveltejs/kit';
import type { Examples } from '../api/examples/all.json/+server.js';

export async function load({ fetch, params }) {
	const examples_res = fetch('/playground/api/examples/all.json').then((r) => r.json());
	const res = await fetch(
		params.id.includes('/')
			? `/playground/api/at/${params.id}`
			: `/playground/api/${params.id}.json`
	);

	// a private atproto app is only readable by its owner, in the browser (see +page.js)
	const maybe_private = params.id.includes('/') && res.status === 404;
	if (!res.ok && !maybe_private) {
		error(res.status);
	}

	const [gist, examples] = await Promise.all([
		res.ok ? res.json() : null,
		examples_res as Promise<Examples>
	]);

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
