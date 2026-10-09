import { resolve } from '#lib/atproto/identity.js';
import { oauth } from '#lib/atproto/oauth.js';
import { scopes_for } from '#lib/atproto/model.js';
import * as session from '#lib/atproto/session.js';
import { error, redirect } from '@sveltejs/kit';

const LEADING_AT_REGEX = /^@/;
const AT_URI_REGEX = /^at:\/\//;
const TRAILING_SLASH_REGEX = /\/+$/;

// Accepts a handle, a DID, an at:// URI, or a pasted profile / apps URL.
function normalize(input: string) {
	let s = input.trim().replace(LEADING_AT_REGEX, '');
	// the authority of an at:// URI comes first; the account of a web URL comes last
	if (AT_URI_REGEX.test(s)) return s.replace(AT_URI_REGEX, '').split('/')[0];
	if (s.includes('/')) {
		s = s.replace(TRAILING_SLASH_REGEX, '');
		s = s.slice(s.lastIndexOf('/') + 1);
	}
	return s.split('?')[0].replace(LEADING_AT_REGEX, '');
}

/** Back to the login form, handle kept. */
function retry(actor: string, reason: 'unknown' | 'failed'): never {
	redirect(303, `/auth/login/atproto?${new URLSearchParams({ actor, error: reason })}`);
}

/** The stored profile outlives its logins. */
async function had_private_apps(actor: string) {
	try {
		const { did } = await resolve(actor);
		return !!(await session.known(did))?.private_apps;
	} catch {
		return false;
	}
}

// `?actor=` logs in. `?escalate=1` re-consents with the space scope, `&delete=1` to delete it.
export async function GET({ url, cookies }) {
	const escalate = url.searchParams.get('escalate') === '1';
	const can_delete = url.searchParams.get('delete') === '1';

	const typed = url.searchParams.get('actor')?.trim() ?? '';
	let actor = typed ? normalize(typed) : null;

	let private_apps = false;

	if (escalate) {
		const current = await session.from_cookies(cookies);
		if (!current) error(401, 'Log in first');
		if (!current.spaces_supported) error(400, 'This PDS does not support spaces');
		actor = current.did;
		private_apps = true;
	} else if (actor) {
		const found = await resolve(actor).then(
			() => true,
			() => false
		);
		if (!found) retry(typed, 'unknown');

		// an account that enabled private apps keeps that scope, logging back in included
		private_apps = await had_private_apps(actor);
	}
	if (!actor) redirect(303, '/auth/login/atproto');

	let target: URL;
	try {
		target = await (
			await oauth(url.origin)
		).authorize(actor, {
			scopes: scopes_for(private_apps, can_delete),
			state: JSON.stringify({ private_apps })
		});
	} catch (e) {
		if (escalate) error(400, (e as Error).message);
		retry(typed, 'failed');
	}
	redirect(302, target.href, { external: true });
}
