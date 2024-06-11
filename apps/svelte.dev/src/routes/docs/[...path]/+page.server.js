import { index } from '$lib/server/content';
import { error, redirect } from '@sveltejs/kit';
import { markedTransform } from '@sveltejs/site-kit/markdown';

export async function load({ params }) {
	const page = index[`docs/${params.path}`];

	if (!page) {
		error(404);
	}

	if (!page.body) {
		let child = page;

		while (child.children[0]) {
			child = child.children[0];
		}

		if (child === page) {
			error(404);
		}

		redirect(307, `/${child.slug}`);
	}

	return {
		// TODO DRY this out
		page: {
			slug: page.slug,
			title: page.title,
			sections: page.sections,
			body: await markedTransform(page.body)
		}
	};
}
