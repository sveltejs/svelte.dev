import * as at from '#lib/atproto/apps.js';
import { profile } from '#lib/atproto/identity.js';
import { error } from '@sveltejs/kit';

export async function load({ url, params }) {
	const search = url.searchParams.get('search');
	const offset_param = url.searchParams.get('offset');
	const offset = offset_param ? parseInt(offset_param) : 0;

	let result;
	try {
		result = await at.list_public(params.handle, search, offset);
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
		apps: result.apps,
		next: result.next,
		search
	};
}
