import * as session from '#lib/db/session.js';
import * as atproto from '#lib/atproto/session.js';
import { DESTINATION_COOKIE, resolve_destination } from '#lib/destination.js';

export const prerender = false;

export async function load({ request, cookies }) {
	const [github, at] = await Promise.all([
		session.from_cookie(request.headers.get('cookie')),
		atproto.from_cookies(cookies)
	]);
	const accounts = { github, atproto: at };

	return {
		accounts,
		destination: resolve_destination(cookies.get(DESTINATION_COOKIE), accounts)
	};
}
