import { docs } from '$lib/server/content';
import { json } from '@sveltejs/kit';

export const prerender = true;

export async function GET() {
	return json(await getLlmDocuments());
}

async function getLlmDocuments() {
	const documents = [];

	for (const [slug, document] of Object.entries(docs.pages)) {
		// Extract the topic and path from the slug (format: docs/topic/path)
		const parts = slug.split('/');
		if (parts.length < 3 || parts[0] !== 'docs') continue;

		const topic = parts[1];
		const path = parts.slice(2).join('/');

		documents.push({
			title: document.metadata.title,
			url: `https://svelte.dev/docs/${topic}/${path}/llms.txt`,
			use_cases: document.metadata.use_cases || undefined
		});
	}

	return documents;
}