import { render } from 'svelte/server';
import { Resvg } from '@resvg/resvg-js';
import { error } from '@sveltejs/kit';
import { read } from '$app/server';
import satori from 'satori';
import { html as toReactNode } from 'satori-html';
import Card from './Card.svelte';
// @ts-expect-error no types for the query exist
import CardCSS from './Card.svelte?raw&svelte&type=style';
import OverpassRegular from './Overpass-Regular.ttf?url';
import { blog_posts } from '$lib/server/content';

export const prerender = true;

export function entries() {
	return blog_posts.map((post) => ({
		slug: post.slug.slice(5) // remove 'blog/' prefix
	}));
}

const height = 630;
const width = 1200;
const data = await read(OverpassRegular).arrayBuffer();

export async function GET({ params }) {
	const post = blog_posts.find((post) => post.slug === `blog/${params.slug}`);

	if (!post) error(404);

	const result = render(Card, { props: post });
	const element = toReactNode(`${result.body}<style>${CardCSS}</style>`);

	const svg = await satori(element, {
		fonts: [
			{
				name: 'Overpass',
				data,
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
