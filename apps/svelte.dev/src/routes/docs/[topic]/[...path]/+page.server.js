import { docs, get_related_links } from '$lib/server/content';
import { render_content } from '$lib/server/renderer';
import { error } from '@sveltejs/kit';

export async function load({ url, params }) {
	const document = docs.pages[`docs/${params.topic}/${params.path}`];

	if (!document) {
		error(404);
	}

	const { references } = docs;

	return {
		document: {
			...document,
			body: await render_content(document.file, document.body, { references })
		},
		related: get_related_links(url.pathname)
	};
}
