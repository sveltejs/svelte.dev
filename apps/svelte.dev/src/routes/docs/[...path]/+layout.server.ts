import { docs } from '$lib/server/content';
import { redirect } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';

export const prerender = true;

export async function load({ params }) {
	const topic = params.path.split('/')[0];
	const document = docs.topics[`docs/${topic}`];

	if (!document) {
		error(404, 'Not found');
	}

	if (params.path === topic) {
		redirect(307, `/${document.children[0].children[0].slug}`);
	}

	return {
		sections: document.children
	};
}
