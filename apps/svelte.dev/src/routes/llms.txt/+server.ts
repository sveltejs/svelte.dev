import { documents_content, generate_llm_content } from '$lib/server/content';

export function GET() {
	const main_content = generate_llm_content(documents_content, {
		ignore: [
			// Svelte ignores
			'../../../content/docs/svelte/07-misc/04-custom-elements.md',
			'../../../content/docs/svelte/07-misc/06-v4-migration-guide.md',
			'../../../content/docs/svelte/07-misc/07-v5-migration-guide.md',
			'../../../content/docs/svelte/07-misc/99-faq.md',
			'../../../content/docs/svelte/07-misc/xx-reactivity-indepth.md',
			'../../../content/docs/svelte/98-reference/21-svelte-legacy.md',
			'../../../content/docs/svelte/99-legacy/**/*.md',
			'../../../content/docs/svelte/98-reference/30-runtime-errors.md',
			'../../../content/docs/svelte/98-reference/30-runtime-warnings.md',
			'../../../content/docs/svelte/98-reference/30-compiler-errors.md',
			'../../../content/docs/svelte/98-reference/30-compiler-warnings.md',
			'**/xx-*.md',

			// SvelteKit ignores
			'../../../content/docs/kit/25-build-and-deploy/*adapter-*.md',
			'../../../content/docs/kit/25-build-and-deploy/99-writing-adapters.md',
			'../../../content/docs/kit/30-advanced/70-packaging.md',
			'../../../content/docs/kit/40-best-practices/05-performance.md',
			'../../../content/docs/kit/60-appendix/**/*.md'
		],
		minimize: {
			removeLegacy: true,
			removeNoteBlocks: true,
			removeDetailsBlocks: true,
			removePlaygroundLinks: true,
			removePrettierIgnore: true,
			normalizeWhitespace: true
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
