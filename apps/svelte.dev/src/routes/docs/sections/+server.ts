import { docs } from '$lib/server/content';
import { json } from '@sveltejs/kit';

export const prerender = true;

export function GET() {
	return json(
		Object.fromEntries(
			Object.entries(docs.pages).map(([key, page]) => [
				key,
				{ metadata: { title: page.metadata.title }, slug: page.slug, file: page.file }
			])
		)
	);
}
