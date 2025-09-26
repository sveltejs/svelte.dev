import { docs } from '$lib/server/content';
import { json } from '@sveltejs/kit';

export const prerender = true;

export async function GET() {
	return json(await getLlmDocuments());
}

async function getLlmDocuments() {
	const documents = [];

	for (const [slug, document] of Object.entries(docs.pages)) {
		documents.push({
			title: document.metadata.title,
			url: `https://svelte.dev/${slug}/llms.txt`,
			use_cases: document.metadata.use_cases || undefined
		});
	}

	return documents;
}