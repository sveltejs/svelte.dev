import { error } from '@sveltejs/kit';
import { docs } from '../content.server';

export const prerender = true;

export async function load({ params }) {
	const page = docs[`docs/${params.path.split('/')[0]}`];

	if (!page) {
		error(404, 'Not found');
	}

	return {
		sections: page.children
	};
}
