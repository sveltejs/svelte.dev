import { docs } from '$lib/server/content';
import { render_content } from '$lib/server/renderer';
import { error, redirect } from '@sveltejs/kit';

export async function load({ params }) {
	const document = docs.pages[params.path];

	if (!document) {
		const topic = docs.topics[params.path];
		if (topic) {
			redirect(307, `/${topic.children[0].children[0].slug}`);
		}
		error(404);
	}

	return {
		document: {
			...document,
			body: await render_content(document.file, document.body)
		}
	};
}
