// We have to set some policy headers due to web containers, which in turn doesn't allow us to load media files from github.
// We therefore have to proxy them through here to add the needed headers.
export async function GET({ request, params, fetch }) {
	const request_headers = new Headers();

	const range = request.headers.get('range');
	const if_range = request.headers.get('if-range');

	if (range) request_headers.set('range', range);
	if (if_range) request_headers.set('if-range', if_range);

	const response = await fetch(`https://sveltejs.github.io/assets/${params.path}`, {
		headers: request_headers
	});

	const response_headers = new Headers(response.headers);
	response_headers.set('cross-origin-resource-policy', 'cross-origin');

	return new Response(response.body, {
		status: response.status,
		headers: response_headers
	});
}
