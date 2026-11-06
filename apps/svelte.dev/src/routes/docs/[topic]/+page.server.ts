import { docs } from '#lib/server/content.ts';
import { error, redirect } from '@sveltejs/kit';

export async function load({ params }) {
	const document = docs.topics[`docs/${params.topic}`] ?? error(404);

	redirect(307, `/${document.children[0].children[0].slug}`);
}
