import { error } from '@sveltejs/kit';
import { examples_promise } from '$lib/server/content.js';

const examples = await examples_promise;

export async function load({ fetch, params, url }) {
	// TODO skip the .json indirection
	const res = await fetch(`/playground/api/${params.id}.json`);

	if (!res.ok) {
		error(res.status);
	}

	const gist = await res.json();

	return {
		gist,
		// TODO do this work in layout instead
		examples: examples
			.filter((section) => !section.title.includes('Embeds'))
			.map((section) => ({
				title: section.title,
				examples: section.examples.map((example) => ({
					title: example.title,
					slug: example.slug
				}))
			})),
		version: url.searchParams.get('version') || 'next' // TODO replace with 'latest' when 5.0 is released
	};
}
