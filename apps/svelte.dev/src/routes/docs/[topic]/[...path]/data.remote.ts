import { redirect } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import { prerender } from '$app/server';
import { create_summary, docs } from '$lib/server/content';
import * as v from 'valibot';
import { render_content } from '$lib/server/renderer';

const schema = v.object({
	path: v.string(),
	topic: v.string()
});

export const get_sections = prerender(schema, (params) => {
	const document = docs.topics[`docs/${params.topic}`];

	// TODO does the dependency on params.path mean this gets regenerated unnecessarily?
	if (!document) {
		// in many cases, https://svelte.dev/docs/foo is now https://svelte.dev/docs/svelte/foo
		if (docs.pages[`docs/svelte/${params.path}`]) {
			redirect(308, `/docs/svelte/${params.path}`);
		}

		error(404, 'Not found');
	}

	return document.children.map(create_summary);
});

export const get_document = prerender(schema, async (params) => {
	const document = docs.pages[`docs/${params.topic}/${params.path}`];

	if (!document) {
		error(404);
	}

	return {
		...document,
		body: await render_content(document.file, document.body)
	};
});
