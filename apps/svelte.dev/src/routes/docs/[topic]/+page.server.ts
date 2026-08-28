import { docs } from '#lib/server/content.ts';
import { redirect } from '@sveltejs/kit';

export async function load({ params }) {
	const document = docs.topics[`docs/${params.topic}`];

	redirect(307, `/${document.children[0].children[0].slug}`);
}
