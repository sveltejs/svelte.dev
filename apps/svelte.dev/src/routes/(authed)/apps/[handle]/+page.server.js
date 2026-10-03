import * as at from '#lib/atproto/apps.js';
import { profile, resolve } from '#lib/atproto/identity.js';
import { error } from '@sveltejs/kit';

export async function load({ url, params }) {
	const search = url.searchParams.get('search');
	// a garbage or negative offset reads as the first page, not an empty one
	const offset = Math.max(0, parseInt(url.searchParams.get('offset') ?? '') || 0);

	// only an account that does not resolve is a 404; an unreachable PDS stays an error
	const identity = await resolve(params.handle).catch(() => error(404, 'not found'));

	const [result, bsky] = await Promise.all([
		at.list_public(identity.did, search, offset),
		profile(identity)
	]);

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
