import { dev } from '$app/environment';
import { query, read } from '$app/server';
import { error } from '@sveltejs/kit';
import { prerender } from '$app/server';
import { examples } from '$lib/server/content';
import * as v from 'valibot';
import { client } from '$lib/db/client.js';
import * as gist from '$lib/db/gist.js';

const UUID_REGEX = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/;

// TODO make this singular
export type Examples = Array<{
	title: string;
	examples: Array<{
		title: string;
		slug: string;
		components: Array<{ name: string; type: string; source: string }>;
	}>;
}>;

async function munge(files: Record<string, string>) {
	const result = [];

	for (const [file, source] of Object.entries(files)) {
		const dot = file.lastIndexOf('.');
		let name = file.slice(0, dot);
		let type = file.slice(dot + 1);

		result.push({ name, type, source: await read(source).text() });
	}

	result.sort((a, b) => {
		if (a.name === 'App' && a.type === 'svelte') return -1;
		if (b.name === 'App' && b.type === 'svelte') return 1;

		if (a.type !== b.type) return a.type === 'svelte' ? -1 : 1;

		return a.name < b.name ? -1 : 1;
	});

	return result;
}

export const get_example_index = prerender(async () => {
	const examples = await get_all_examples();

	return examples
		.filter((section) => !section.title.includes('Embeds'))
		.map((section) => ({
			title: section.title,
			examples: section.examples.map((example) => ({
				title: example.title,
				slug: example.slug
			}))
		}));
});

export const get_all_examples = prerender(async () => {
	return (await Promise.all(
		examples.map(async (section) => ({
			title: section.metadata.title,
			examples: await Promise.all(
				section.children.map(async (example) => ({
					title: example.metadata.title,
					slug: example.slug.split('/').pop()!,
					components: await munge(example.assets!)
				}))
			)
		}))
	)) as Examples;
});

interface PlaygroundApp {
	id: string;
	name: string;
	owner: string | null;
	relaxed: boolean;
	components: Array<{
		// TODO
	}>;
}

export const get_gist = query(v.string(), async (id) => {
	const example = (await get_all_examples())
		.flatMap((section) => section.examples)
		.find((example) => example.slug.split('/').pop() === id);

	if (example) {
		return {
			id,
			name: example.title,
			owner: null,
			relaxed: false, // TODO is this right? EDIT: It was example.relaxed before, which no example return to my knowledge. By @PuruVJ
			components: example.components
		};
	}

	if (dev && !client) {
		// in dev with no local Supabase configured, proxy to production
		// this lets us at least load saved REPLs
		const res = await fetch(`https://svelte.dev/playground/api/${id}.json`);

		const gist = (await res.json()) as PlaygroundApp;
		return gist;
	}

	if (!UUID_REGEX.test(id)) {
		error(404);
	}

	const app = await gist.read(id);

	if (!app) {
		error(404, 'not found');
	}

	return {
		id,
		name: app.name!, // TODO can this be undefined?
		// @ts-ignore
		owner: app.userid,
		relaxed: false,
		components: app.files!.map((file) => {
			const dot = file.name.lastIndexOf('.');
			let name = file.name.slice(0, dot);
			let type = file.name.slice(dot + 1);
			return { name, type, source: file.source };
		})
	};
});
