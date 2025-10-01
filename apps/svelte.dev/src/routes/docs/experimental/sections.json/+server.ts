import { docs } from '$lib/server/content';
import { json } from '@sveltejs/kit';

export const prerender = true;

export function GET() {
	return json(
		Object.fromEntries(
			Object.entries(docs.pages).map(([key, page]) => [
				key,
				{
					metadata: { title: page.metadata.title, use_cases: page.metadata.use_cases },
					slug: page.slug
				}
			])
		)
	);
}
