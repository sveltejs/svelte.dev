import { index } from '$lib/server/content';
import { render_content } from '$lib/server/renderer';
import { error, redirect } from '@sveltejs/kit';

export async function load({ params }) {
	const document = index[`docs/${params.path}`];

	if (!document) {
		error(404);
	}

	if (!document.body) {
		let child = document;

		while (child.children[0]) {
			child = child.children[0];
		}

		if (child === document) {
			error(404);
		}

		redirect(307, `/${child.slug}`);
	}

	const pkg = params.path.split('/')[0];

	return {
		document: {
			...document,
			body: await render_content(document.file, document.body),
			prev: document.prev?.slug.startsWith(`docs/${pkg}/`) ? document.prev : null,
			next: document.next?.slug.startsWith(`docs/${pkg}/`) ? document.next : null
		}
	};
}
