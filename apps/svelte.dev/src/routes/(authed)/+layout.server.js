import * as session from '#lib/db/session';

export const prerender = false;

export async function load({ request }) {
	return {
		user: await session.from_cookie(request.headers.get('cookie'))
	};
}
