import { error } from '@sveltejs/kit';
import Card from './Card.svelte';
import { render_card } from '#lib/server/card.ts';
import { docs } from '#lib/server/content.ts';
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

export async function GET({ params }) {
	const document = docs.pages[`docs/${params.topic}/${params.path}`];

	if (!document) error(404);

	return render_card(Card, {
		title: document.metadata.title,
		breadcrumbs: document.breadcrumbs.slice(1)
	});
}
