import { examples } from '$lib/server/content';
import { json } from '@sveltejs/kit';
import { get_all_examples, get_example, get_example_index, get_gist } from '../../data.remote.js';

export const prerender = 'auto';

export async function GET({ params }) {
	const slugs = (await get_all_examples())
		.flatMap((section) => section.examples)
		.map((example) => example.slug);

	return json(slugs.includes(params.id) ? await get_example(params.id) : await get_gist(params.id));
}

export async function entries() {
	return examples
		.flatMap((section) => section.children)
		.map((example) => ({ id: example.slug.split('/').pop()! }));
}
