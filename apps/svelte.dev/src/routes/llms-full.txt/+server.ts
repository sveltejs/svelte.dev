import { generate_llm_content } from '$lib/server/content';

export const prerender = true;

export function GET() {
	const content = `<SYSTEM>This is the full developer documentation for Svelte and SvelteKit.</SYSTEM>\n\n${generate_llm_content()}`;

	return new Response(content, {
		status: 200,
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
}