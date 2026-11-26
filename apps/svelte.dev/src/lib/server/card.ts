import { render } from 'svelte/server';
import { Resvg } from '@resvg/resvg-js';
import { read } from '$app/server';
import satori from 'satori';
import { html as toReactNode } from 'satori-html';
import type { Component } from 'svelte';
import DMSerifDisplay from '#lib/fonts/DMSerifDisplay-Regular.ttf?url';
import FiraSans from '#lib/fonts/FiraSans-Regular.ttf?url';
import { decode_html } from '#lib/utils/escape.js';

type VNode = ReturnType<typeof toReactNode>;

const height = 630;
const width = 1200;
const dm_serif_display = await read(DMSerifDisplay).arrayBuffer();
const fira_sans = await read(FiraSans).arrayBuffer();

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

/**
 * Renders a component as the PNG shown where a page is shared. The component can use the
 * `DMSerif Display` and `Fira Sans` fonts
 */
export async function render_card<Props extends Record<string, any>>(
	card: Component<Props>,
	props: Props
) {
	const result = render(card, { props });
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
