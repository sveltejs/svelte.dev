import type { RequestHandler } from './$types';
import { documentsContent, generateCombinedContent } from '$lib/server/content';

const PREFIX = 'This is the full developer documentation for Svelte and SvelteKit.';

export const GET: RequestHandler = async () => {
	const content = `${PREFIX}\n\n${generateCombinedContent(documentsContent)}`;

	return new Response(content, {
		status: 200,
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};

export const prerender = true;
