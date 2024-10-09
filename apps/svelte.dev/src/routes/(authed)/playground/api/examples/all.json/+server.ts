import { read } from '$app/server';
import { examples } from '$lib/server/content';
import { json } from '@sveltejs/kit';

export type Examples = Array<{
	title: string;
	examples: Array<{
		title: string;
		slug: string;
		components: Array<{ name: string; type: string; source: string }>;
	}>;
}>;

export const prerender = true;

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

// TODO move this into examples.json once we have fixed this SvelteKit bug:
// [id].json/+server.ts contained a fetch to examples.json, but it did not turn up here and instead recursed to itself.

// Examples are prerendered to avoid making FS requests at runtime,
// things needing the examples data will need to go through this endpoint
export async function GET() {
	return json(
		(await Promise.all(
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
		)) as Examples
	);
}
