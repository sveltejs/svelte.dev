import { index } from '#lib/server/content.js';
import { render_content } from '#lib/server/renderer.js';
import { read } from '$app/server';
import { error } from '@sveltejs/kit';

export const prerender = true;

const docs = index.docs.children.find((d) => d.slug === 'docs/kit')!;
const messages = await read(docs.assets!['messages.json']).json();

export async function load({ params }) {
	const message = messages[params.code] ?? error(404);

	return {
		variants: await Promise.all(
			message.variants.map((v: any) => render_content('', v.text, { check: false }))
		),
		details: await render_content('', message.details, { check: false })
	};
}

export function entries() {
	return Object.keys(messages).map((code) => ({ code }));
}
