import { docs } from '$lib/server/content';
import { render_content } from '$lib/server/renderer';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
	const document = docs.pages[`docs/${params.topic}/${params.path}`];

	if (!document) {
		error(404);
	}

	return {
		document: {
			...document,
			body: await render_content(document.file, document.body)
		}
	};
}
