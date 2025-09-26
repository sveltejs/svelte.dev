import { docs } from '$lib/server/content';
import { json } from '@sveltejs/kit';

export const prerender = true;

export function GET({ url: { searchParams } }) {
	const complete = searchParams.has('complete');
	// by default we return a light version with just the title, the slug and the file path
	// but the user can opt in to get the complete content by adding ?complete
	if (complete) {
		return json(docs.pages);
	}
	return json(
		Object.fromEntries(
			Object.entries(docs.pages).map(([key, page]) => [
				key,
				{ metadata: { title: page.metadata.title }, slug: page.slug, file: page.file }
			])
		)
	);
}
