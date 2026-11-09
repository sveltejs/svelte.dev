import { render } from 'svelte/server';
import { Resvg } from '@resvg/resvg-js';
import { read } from '$app/server';
import satori from 'satori';
import { html as toReactNode } from 'satori-html';
import Card from './Card.svelte';
import DMSerifDisplay from '#lib/fonts/DMSerifDisplay-Regular.ttf?url';
import FiraSans from '#lib/fonts/FiraSans-Regular.ttf?url';

export const prerender = true;

const width = 1200;
const height = 630;
const dm_serif_display = await read(DMSerifDisplay).arrayBuffer();
const fira_sans = await read(FiraSans).arrayBuffer();

export async function GET() {
	const result = render(Card);
	const element = toReactNode(`<head>${result.head}</head>${result.body}`);

	const svg = await satori(element, {
		fonts: [
			{ name: 'DM Serif Display', data: dm_serif_display, style: 'normal', weight: 400 },
			{ name: 'Fira Sans', data: fira_sans, style: 'normal', weight: 400 }
		],
		width,
		height
	});

	const image = new Resvg(svg, { fitTo: { mode: 'width', value: width } }).render();

	return new Response(new Uint8Array(image.asPng()), {
		headers: {
			'content-type': 'image/png',
			'cache-control': 'public, max-age=600'
		}
	});
}
