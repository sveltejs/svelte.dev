import { create_summary, docs } from '$lib/server/content';
import { redirect } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
	const document = docs.topics[`docs/${params.topic}`];

	if (!document) {
		// in many cases, https://svelte.dev/docs/foo is now https://svelte.dev/docs/svelte/foo
		if (docs.pages[`docs/svelte/${params.path}`]) {
			redirect(308, `/docs/svelte/${params.path}`);
		}

		error(404, 'Not found');
	}

	return {
		sections: document.children.map(create_summary)
	};
}
