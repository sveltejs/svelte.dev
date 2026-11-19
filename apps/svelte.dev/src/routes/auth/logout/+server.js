import * as cookie from 'cookie';
import * as session from '#lib/db/session.js';

export async function GET({ request, url }) {
	const cookies = cookie.parseCookie(request.headers.get('cookie') || '');
	if (cookies.sid) {
		await session.destroy(cookies.sid);
	}

	return new Response(undefined, {
		headers: {
			'Set-Cookie': cookie.stringifySetCookie({
				name: 'sid',
				value: '',
				maxAge: -1,
				path: '/',
				httpOnly: true,
				secure: url.protocol === 'https'
			})
		}
	});
}
