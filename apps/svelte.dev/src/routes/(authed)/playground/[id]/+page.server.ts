import { error } from '@sveltejs/kit';
import type { Examples } from '../api/examples/all.json/+server.js';

export async function load({ fetch, params, url }) {
	const examples_res = fetch('/playground/api/examples/all.json').then((r) => r.json());
	const res = await fetch(`/playground/api/${params.id}.json`);

	if (!res.ok) {
		error(res.status);
	}

	const [gist, examples] = await Promise.all([res.json(), examples_res as Promise<Examples>]);

	let version = url.searchParams.get('version') || 'latest';

	let is_pkg_pr_new = false;

	try {
		const url = new URL(version);
		is_pkg_pr_new = url.origin === 'https://pkg.pr.new';
	} catch {}

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
			})),
		version: url.searchParams.get('version') || 'latest',
		is_pkg_pr_new
	};
}
