import svelte from './content-svelte.md?raw';
import sveltekit from './content-sveltekit.md?raw';

export function GET() {
	const content =
		'<SYSTEM>This is the abridged developer documentation for Svelte and SvelteKit.</SYSTEM>\n\n' +
		`# Svelte documentation\n\n${svelte}\n\n# SvelteKit documentation\n\n${sveltekit}`;

	return new Response(content, {
		status: 200,
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
}

export const prerender = true;
