import { profile, resolve } from '#lib/atproto/identity.js';
import { pds_supports_spaces } from '#lib/atproto/space.js';
import { error, json } from '@sveltejs/kit';

export const prerender = false;

// Handle resolution stays server-side: DNS-over-HTTPS and .well-known aren't reachable from a browser
export async function GET({ url }) {
	const actor = url.searchParams.get('actor');
	if (!actor) error(400, 'missing actor');

	let identity;
	try {
		identity = await resolve(actor);
	} catch (e) {
		error(400, `Could not resolve ${actor}: ${(e as Error).message}`);
	}

	const [bsky, spaces_supported] = await Promise.all([
		profile(identity),
		pds_supports_spaces(identity.pds)
	]);

	return json({
		...identity,
		display_name: bsky?.display_name ?? '',
		avatar: bsky?.avatar ?? '',
		spaces_supported
	});
}
