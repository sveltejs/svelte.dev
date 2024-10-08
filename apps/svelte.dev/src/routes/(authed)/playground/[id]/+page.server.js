import { error } from '@sveltejs/kit';

export async function load({ fetch, params, url }) {
	const examples_res = fetch('/playground/api/examples.json').then((r) => r.json());
	const res = await fetch(`/playground/api/${params.id}.json`);

	if (!res.ok) {
		error(/** @type {import('@sveltejs/kit').NumericRange<400, 599>}  */ (res.status));
	}

	const [gist, examples] = await Promise.all([res.json(), examples_res]);

	return {
		gist,
		examples,
		version: url.searchParams.get('version') || 'next' // TODO replace with 'latest' when 5.0 is released
	};
}
