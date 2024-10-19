import { dev } from '$app/environment';
import { client } from '$lib/db/client.js';
import * as gist from '$lib/db/gist.js';
import { examples } from '$lib/server/content';
import { error, json } from '@sveltejs/kit';
import type { Examples } from '../examples/all.json/+server.js';

export const prerender = 'auto';

const UUID_REGEX = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/;

export async function GET({ fetch, params }) {
	const examples: Examples = await fetch('/playground/api/examples/all.json').then((r) => r.json());
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

	if (dev && !client) {
		// in dev with no local Supabase configured, proxy to production
		// this lets us at least load saved REPLs
		const res = await fetch(`https://svelte.dev/playground/api/${params.id}.json`);

		// returning the response directly results in a bizarre
		// content encoding error, so we create a new one
		return new Response(await res.text(), {
			status: res.status,
			headers: {
				'content-type': 'application/json'
			}
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
	return examples
		.flatMap((section) => section.children)
		.map((example) => ({ id: example.slug.split('/').pop()! }));
}
