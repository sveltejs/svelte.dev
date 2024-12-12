import type { RequestHandler } from './$types';
import { documents_content, generate_llm_content } from '$lib/server/content';

const PREFIX =
	'<SYSTEM>This is the full developer documentation for Svelte and SvelteKit.</SYSTEM>';

export const GET: RequestHandler = async () => {
	const content = `${PREFIX}\n\n${generate_llm_content(documents_content)}`;

	return new Response(content, {
		status: 200,
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};

export const prerender = true;
