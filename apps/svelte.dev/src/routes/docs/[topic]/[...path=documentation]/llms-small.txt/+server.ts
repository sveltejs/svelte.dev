import { error } from '@sveltejs/kit';
import svelte from '../../../../llms-small.txt/content-svelte.md?raw';
import sveltekit from '../../../../llms-small.txt/content-sveltekit.md?raw';

export const prerender = true;

export function entries() {
	return [
		{ topic: 'svelte', path: '' },
		{ topic: 'kit', path: '' }
	];
}

export function GET({ params }) {
	if ((params.topic !== 'svelte' && params.topic !== 'kit') || params.path) {
		error(404, 'Not Found');
	}

	const content = params.topic === 'kit' ? sveltekit : svelte;

	return new Response(content, {
		status: 200,
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
}
