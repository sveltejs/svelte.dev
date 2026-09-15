import * as session from '#lib/db/session.js';
import * as atproto from '#lib/atproto/profile.js';
import { DESTINATION_COOKIE, resolve_destination } from '#lib/destination.js';

export const prerender = false;

export async function load({ request, cookies }) {
	const stored = atproto.from_cookie(cookies.get(atproto.COOKIE));
	const accounts = {
		github: await session.from_cookie(request.headers.get('cookie')),
		atproto: stored && (({ authorized_at, ...user }) => user)(stored)
	};

	return {
		accounts,
		destination: resolve_destination(cookies.get(DESTINATION_COOKIE), accounts),
		renew_atproto: !!stored && Date.now() - stored.authorized_at > atproto.RENEW_AFTER_MS
	};
}
