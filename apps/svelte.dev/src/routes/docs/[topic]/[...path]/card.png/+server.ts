import { render } from 'svelte/server';
import { Resvg } from '@resvg/resvg-js';
import { error } from '@sveltejs/kit';
import { read } from '$app/server';
import satori from 'satori';
import { html as toReactNode } from 'satori-html';
import Card from './Card.svelte';
import DMSerifDisplay from '$lib/fonts/DMSerifDisplay-Regular.ttf?url';
import FiraSans from '$lib/fonts/FiraSans-Regular.ttf?url';
import { docs } from '$lib/server/content';
import { decode_html } from '$lib/utils/escape';
import type { ServerlessConfig } from '@sveltejs/adapter-vercel';

export const config: ServerlessConfig = {
	isr: {
		expiration: false
	}
};

export function entries() {
	return Object.keys(docs.pages).map((doc) => {
		const full = doc.slice(5); // removes 'docs/' prefix
		const [topic, ...path] = full.split('/');
		return {
			topic,
			path: path.join('/')
		};
	});
}

type VNode = ReturnType<typeof toReactNode>;

/**
 * Decodes the XML-ified parts of string subnodes
 * to revert to the original content
 *
 * @param node the original node
 * @returns the node with replaced leaves
 */
function decode_vnode(node: VNode): VNode {
	const children = node.props.children;
	if (!children) return node;

	const decodedChildren =
		typeof children === 'string'
			? decode_html(children)
			: Array.isArray(children)
				? children.map(decode_vnode)
				: decode_vnode(children);

	if (decodedChildren === children) return node;

	return {
		...node,
		props: { ...node.props, children: decodedChildren }
	};
}

const height = 630;
const width = 1200;
const dm_serif_display = await read(DMSerifDisplay).arrayBuffer();
const fira_sans = await read(FiraSans).arrayBuffer();

export async function GET({ params }) {
	const document = docs.pages[`docs/${params.topic}/${params.path}`];

	if (!document) error(404);

	const result = render(Card, {
		props: { title: document.metadata.title, breadcrumbs: document.breadcrumbs.slice(1) }
	});
	const element = toReactNode(`<head>${result.head}</head>${result.body}`);

	const svg = await satori(decode_vnode(element), {
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

	return new Response(new Uint8Array(image.asPng()), {
		headers: {
			'content-type': 'image/png',
			'cache-control': 'public, max-age=600' // cache for 10 minutes
		}
	});
}
