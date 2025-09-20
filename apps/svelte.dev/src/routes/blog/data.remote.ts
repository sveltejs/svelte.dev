import { prerender } from '$app/server';
import { blog_posts } from '$lib/server/content';
import { render_content } from '$lib/server/renderer';
import { error } from '@sveltejs/kit';
import * as v from 'valibot';

export const get_all_posts = prerender(() => {
	return blog_posts
		.map((document) => ({
			metadata: document.metadata,
			date: document.date,
			date_formatted: document.date_formatted,
			authors: document.authors,
			slug: document.slug
		}))
		.filter((document) => !document.metadata.draft);
});

export const get_post = prerender(v.string(), async (slug) => {
	const document = blog_posts.find((document) => document.slug === `blog/${slug}`);

	if (!document) error(404);

	// forgive me — terrible hack necessary to get diffs looking sensible
	// on the `runes` blog post
	const markdown = document.body.replace(/(    )+/gm, (match) => '  '.repeat(match.length / 4));

	return {
		...document,
		body: await render_content(document.file, markdown)
	};
});
