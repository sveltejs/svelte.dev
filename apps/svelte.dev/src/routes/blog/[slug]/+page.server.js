import { error } from '@sveltejs/kit';
import { blog_posts } from '$lib/server/content';
import { render_content } from '$lib/server/renderer';

export async function load({ params }) {
	const document = blog_posts.find((document) => document.slug === `blog/${params.slug}`);

	if (!document) error(404);

	// forgive me — terrible hack necessary to get diffs looking sensible
	// on the `runes` blog post
	const markdown = document.body.replace(/(    )+/gm, (match) => '  '.repeat(match.length / 4));

	return {
		...document,
		body: await render_content(document.file, markdown)
	};
}
