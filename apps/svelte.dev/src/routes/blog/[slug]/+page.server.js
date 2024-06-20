import { error } from '@sveltejs/kit';
import { blog_posts } from '$lib/server/content';
import { render_content } from '$lib/server/renderer';

export const prerender = true;

export async function load({ params }) {
	const post = blog_posts.find((post) => post.slug === `blog/${params.slug}`);

	if (!post) error(404);

	// forgive me — terrible hack necessary to get diffs looking sensible
	// on the `runes` blog post
	post.body = post.body.replace(/(    )+/gm, (match) => '  '.repeat(match.length / 4));

	return {
		title: post.title,
		description: post.description,
		path: `/${post.slug}`,
		date: post.date,
		date_formatted: post.date_formatted,
		body: await render_content(post.file, post.body),
		authors: post.authors,
		sections: post.sections
	};
}
