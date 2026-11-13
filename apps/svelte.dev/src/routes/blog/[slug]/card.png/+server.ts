import { error } from '@sveltejs/kit';
import Card from './Card.svelte';
import { render_card } from '#lib/server/card.ts';
import { blog_posts } from '#lib/server/content.ts';
import type { ServerlessConfig } from '@sveltejs/adapter-vercel';

export const config: ServerlessConfig = {
	isr: {
		expiration: false
	}
};

export function entries() {
	return blog_posts.map((post) => ({
		slug: post.slug.slice(5) // remove 'blog/' prefix
	}));
}

export async function GET({ params }) {
	const post = blog_posts.find((post) => post.slug === `blog/${params.slug}`);

	if (!post) error(404);

	return render_card(Card, { title: post.metadata.title, date: post.date_formatted });
}
