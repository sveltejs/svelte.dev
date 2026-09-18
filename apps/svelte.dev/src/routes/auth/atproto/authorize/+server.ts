import { resolve } from '#lib/atproto/identity.js';
import { oauth } from '#lib/atproto/oauth.js';
import { scopes_for } from '#lib/atproto/model.js';
import * as session from '#lib/atproto/session.js';
import { error, redirect } from '@sveltejs/kit';

/** Did this account enable private apps before? The stored profile outlives its logins. */
async function had_private_apps(actor: string) {
	try {
		const { did } = await resolve(actor);
		return !!(await session.known(did))?.private_apps;
	} catch {
		return false;
	}
}

// `?actor=` starts a login. `?escalate=1` re-runs consent for the logged-in account with the
// private-apps (space) scope; `&delete=1` adds the permission to delete the space.
export async function GET({ url, cookies }) {
	const escalate = url.searchParams.get('escalate') === '1';
	const can_delete = url.searchParams.get('delete') === '1';

	let actor = url.searchParams.get('actor');
	let private_apps = false;

	const current = await session.from_cookies(cookies);
	if (escalate) {
		if (!current) error(401, 'Log in first');
		if (!current.spaces_supported) error(400, 'This PDS does not support spaces');
		actor = current.did;
		private_apps = true;
	} else if (actor) {
		// an account that enabled private apps keeps that scope, logging back in included
		private_apps =
			current && (current.handle === actor || current.did === actor)
				? current.private_apps
				: await had_private_apps(actor);
	}
	if (!actor) error(400, 'missing actor');

	let target: URL;
	try {
		target = await (
			await oauth(url.origin)
		).authorize(actor, {
			scopes: scopes_for(private_apps, can_delete),
			state: JSON.stringify({ private_apps })
		});
	} catch (e) {
		error(400, (e as Error).message);
	}
	redirect(302, target.href, { external: true });
}
