import { examples } from '$lib/server/content';
import { json } from '@sveltejs/kit';
import { get_gist } from '../../data.remote.js';

export const prerender = 'auto';

export async function GET({ params }) {
	return json(await get_gist(params.id));
}

export async function entries() {
	return examples
		.flatMap((section) => section.children)
		.map((example) => ({ id: example.slug.split('/').pop()! }));
}
