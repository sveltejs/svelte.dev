import { redirect } from '@sveltejs/kit';

export function load({ url }) {
	if (url.searchParams.has('example')) {
		throw redirect(301, construct_embed_url(url.searchParams, 'example'));
	} else if (url.searchParams.has('gist')) {
		throw redirect(301, construct_embed_url(url.searchParams, 'gist'));
	} else {
		throw redirect(301, '/playground/hello-world/embed');
	}
}

function construct_embed_url(searchParams: URLSearchParams, param: string) {
	const cleaned_params = new URLSearchParams(searchParams);
	cleaned_params.delete(param);
	return `/playground/${searchParams.get(param)}/embed?${cleaned_params.toString()}`;
}
