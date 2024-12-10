import type { RequestHandler } from './$types';
import { documentsContent, generateContent } from '$lib/server/content';

const PREFIX =
	'<SYSTEM>This is the full developer documentation for Svelte and SvelteKit.</SYSTEM>';

export const GET: RequestHandler = async () => {
	const content = `${PREFIX}\n\n${generateContent(documentsContent)}`;

	return new Response(content, {
		status: 200,
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};

export const prerender = true;
