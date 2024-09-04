import { docs } from '$lib/server/content';
import { error } from '@sveltejs/kit';

export const prerender = true;

export async function load({ params }) {
	const page = docs.topics[params.path.split('/')[0]];

	if (!page) {
		error(404, 'Not found');
	}

	return {
		sections: page.children
	};
}
