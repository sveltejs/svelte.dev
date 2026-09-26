import { ScopeError } from 'airspace';
import { with_user } from '#lib/atproto/endpoint.js';
import * as apps from '#lib/atproto/apps.js';
import * as session from '#lib/atproto/session.js';
import { error } from '@sveltejs/kit';

/** Deletes the space and every private app in it. Enabling goes through OAuth consent. */
export async function DELETE({ url, cookies }) {
	await with_user(cookies, async (user, sid) => {
		try {
			await apps.disable_private(url.origin, user);
		} catch (e) {
			// grant predates the delete permission: the client re-runs consent and retries
			if (e instanceof ScopeError) error(403);
			throw e;
		}
		await session.update(sid, { private_apps: false });
	});

	return new Response(undefined, { status: 204 });
}
