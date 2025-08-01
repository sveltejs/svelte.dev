import { render } from 'svelte/server';
import { Resvg } from '@resvg/resvg-js';
import { error } from '@sveltejs/kit';
import { read } from '$app/server';
import satori from 'satori';
import { html as toReactNode } from 'satori-html';
import Card from './Card.svelte';
import DMSerifDisplay from '$lib/fonts/DMSerifDisplay-Regular.ttf?url';
import FiraSans from '$lib/fonts/FiraSans-Regular.ttf?url';
import { blog_posts } from '$lib/server/content';
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

const height = 630;
const width = 1200;
const dm_serif_display = await read(DMSerifDisplay).arrayBuffer();
const fira_sans = await read(FiraSans).arrayBuffer();

export async function GET({ params }) {
	const post = blog_posts.find((post) => post.slug === `blog/${params.slug}`);

	if (!post) error(404);

	const result = render(Card, { props: { title: post.metadata.title, date: post.date_formatted } });
	const element = toReactNode(`<head>${result.head}</head>${result.body}`);

	const svg = await satori(element, {
		fonts: [
			{
				name: 'DMSerif Display',
				data: dm_serif_display,
				style: 'normal',
				weight: 400
			},
			{
				name: 'Fira Sans',
				data: fira_sans,
				style: 'normal',
				weight: 400
			}
		],
		height,
		width
	});

	const resvg = new Resvg(svg, {
		fitTo: {
			mode: 'width',
			value: width
		}
	});

	const image = resvg.render();

	return new Response(image.asPng(), {
		headers: {
			'content-type': 'image/png',
			'cache-control': 'public, max-age=600' // cache for 10 minutes
		}
	});
}
