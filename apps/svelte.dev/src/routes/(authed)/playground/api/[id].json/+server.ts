import { dev } from '$app/environment';
import { client } from '$lib/db/client.js';
import * as gist from '$lib/db/gist.js';
import { index, examples_promise } from '$lib/server/content';
import { error, json } from '@sveltejs/kit';

export const prerender = 'auto';

const UUID_REGEX = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/;

const examples = await examples_promise;

export async function GET({ fetch, params }) {
	const example = examples
		.flatMap((section) => section.examples)
		.find((example) => example.slug.split('/').pop() === params.id);

	if (example) {
		return json({
			id: params.id,
			name: example.title,
			owner: null,
			relaxed: false, // TODO is this right? EDIT: It was example.relaxed before, which no example return to my knowledge. By @PuruVJ
			components: example.components
		});
	}

	if (!UUID_REGEX.test(params.id)) {
		error(404);
	}

	const app = await gist.read(params.id);

	if (!app) {
		error(404, 'not found');
	}

	return json({
		id: params.id,
		name: app.name,
		// @ts-ignore
		owner: app.userid,
		relaxed: false,
		components: app.files!.map((file) => {
			const dot = file.name.lastIndexOf('.');
			let name = file.name.slice(0, dot);
			let type = file.name.slice(dot + 1);
			return { name, type, source: file.source };
		})
	});
}

export async function entries() {
	return index.examples.children
		.flatMap((section) => section.children)
		.map((example) => ({ id: example.slug.split('/').pop()! }));
}
