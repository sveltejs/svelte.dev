import * as at from '#lib/atproto/public.js';
import { profile } from '#lib/atproto/identity.js';
import { error } from '@sveltejs/kit';

export async function load({ url, params }) {
	const search = url.searchParams.get('search');

	let result;
	try {
		result = await at.list(params.handle, search);
	} catch {
		error(404, 'not found');
	}

	const bsky = await profile(result.identity);

	return {
		owner: {
			handle: result.identity.handle,
			display_name: bsky?.display_name ?? '',
			avatar: bsky?.avatar ?? ''
		},
		gists: result.gists,
		search
	};
}
