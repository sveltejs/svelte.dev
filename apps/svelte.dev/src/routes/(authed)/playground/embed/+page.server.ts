import { redirect } from '@sveltejs/kit';

export function load({ url }) {
	if (url.searchParams.has('example')) {
		redirect(307, construct_embed_url(url.searchParams, 'example'));
	} else if (url.searchParams.has('gist')) {
		redirect(307, construct_embed_url(url.searchParams, 'gist'));
	} else {
		redirect(307, '/playground/hello-world/embed');
	}
}

function construct_embed_url(searchParams: URLSearchParams, param: string) {
	const cleaned_params = new URLSearchParams(searchParams);
	cleaned_params.delete(param);
	return `/playground/${searchParams.get(param)}/embed?${cleaned_params.toString()}`;
}
