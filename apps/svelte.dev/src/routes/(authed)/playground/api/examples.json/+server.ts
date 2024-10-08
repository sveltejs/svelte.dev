import { examples } from '$lib/server/content';
import { json } from '@sveltejs/kit';

export type Examples = Array<{
	title: string;
	examples: Array<{
		title: string;
		slug: string;
	}>;
}>;

export const prerender = true;

export async function GET() {
	return json(
		examples
			.filter((section) => !section.slug.includes('/embeds'))
			.map((section) => ({
				title: section.metadata.title,
				examples: section.children.map((example) => ({
					title: example.metadata.title,
					slug: example.slug.split('/').pop()!
				}))
			}))
	);
}
