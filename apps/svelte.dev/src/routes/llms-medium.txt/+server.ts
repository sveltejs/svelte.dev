import { generate_llm_content } from '$lib/server/llms';
import { topics } from '$lib/topics';

export function GET() {
	const main_content = generate_llm_content({
		topics,
		ignore: [
			// Svelte ignores
			'docs/svelte/legacy/**/*',
			'docs/svelte/misc/custom-elements',
			'docs/svelte/misc/v4-migration-guide',
			'docs/svelte/misc/v5-migration-guide',
			'docs/svelte/misc/faq',
			'docs/svelte/reference/compiler-errors',
			'docs/svelte/reference/compiler-warnings',
			'docs/svelte/reference/runtime-errors',
			'docs/svelte/reference/runtime-warnings',
			'docs/svelte/reference/svelte-legacy',
			'**/xx-*',

			// SvelteKit ignores
			'docs/kit/advanced/packaging',
			'docs/kit/appendix/**/*',
			'docs/kit/best-practices/performance',
			'docs/kit/build-and-deploy/*adapter-*',
			'docs/kit/build-and-deploy/writing-adapters'
		],
		minimize: {
			remove_legacy: true,
			remove_note_blocks: true,
			remove_details_blocks: true,
			remove_playground_links: true,
			remove_prettier_ignore: true
		}
	});
	const content = `<SYSTEM>This is the abridged developer documentation for Svelte and SvelteKit.</SYSTEM>\n\n${main_content}`;

	return new Response(content, {
		status: 200,
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
}

export const prerender = true;
