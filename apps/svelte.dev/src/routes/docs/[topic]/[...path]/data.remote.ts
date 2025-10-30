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

export const get_sections = prerender(v.string(), (topic) => {
	const document = docs.topics[`docs/${topic}`];
	if (!document) error(404, 'Not found');

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
