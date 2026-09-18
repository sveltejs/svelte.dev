import * as session from '#lib/db/session.js';
import * as atproto from '#lib/atproto/session.js';
import { DESTINATION_COOKIE, resolve_destination } from '#lib/destination.js';

export const prerender = false;

export async function load({ request, cookies }) {
	const accounts = {
		github: await session.from_cookie(request.headers.get('cookie')),
		atproto: await atproto.from_cookies(cookies)
	};

	return {
		accounts,
		destination: resolve_destination(cookies.get(DESTINATION_COOKIE), accounts)
	};
}
