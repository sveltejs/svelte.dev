import { dev } from '$app/environment';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	if (event.url.pathname.startsWith('/docs')) {
		return new Response(null, {
			status: dev ? 307 : 308,
			headers: { location: 'https://svelte.dev/docs/kit' + event.url.pathname.substring('/docs'.length) },
		});
	}
	return new Response(null, {
		status: dev ? 307 : 308,
		headers: { location: 'https://svelte.dev/' },
	});
}
