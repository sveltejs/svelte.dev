import { blog_posts } from '$lib/server/content';

export async function load() {
	const posts = blog_posts
		.map((document) => ({
			metadata: document.metadata,
			date: document.date,
			date_formatted: document.date_formatted,
			authors: document.authors,
			slug: document.slug
		}))
		.filter((document) => !document.metadata.draft);

	return {
		posts
	};
}
