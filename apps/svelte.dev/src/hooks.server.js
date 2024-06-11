/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	const response = await resolve(event, {
		preload: ({ type }) => type === 'js' || type === 'css' || type === 'font'
	});

	if (event.url.pathname.startsWith('/tutorial')) {
		response.headers.set('cross-origin-opener-policy', 'same-origin');
		response.headers.set('cross-origin-embedder-policy', 'require-corp');
		response.headers.set('cross-origin-resource-policy', 'cross-origin');
	}

	return response;
}
