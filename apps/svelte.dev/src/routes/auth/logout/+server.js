import * as cookie from 'cookie';
import * as session from '#lib/db/session.js';

// POST only: a cross-site link must not be able to log the user out
export async function POST({ request, url }) {
	const cookies = cookie.parse(request.headers.get('cookie') || '');
	if (cookies.sid) {
		await session.destroy(cookies.sid);
	}

	return new Response(undefined, {
		headers: {
			'Set-Cookie': cookie.serialize('sid', '', {
				maxAge: -1,
				path: '/',
				httpOnly: true,
				secure: url.protocol === 'https:'
			})
		}
	});
}
