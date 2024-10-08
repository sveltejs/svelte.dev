import * as cookie from 'cookie';
import * as session from '$lib/db/session';
import { oauth, storage_key } from '../_config.js';
import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from '$env/static/private';

export async function GET({ url }) {
	// Trade "code" for "access_token"
	const code = url.searchParams.get('code') || undefined;
	const params = new URLSearchParams({
		client_id: GITHUB_CLIENT_ID,
		client_secret: GITHUB_CLIENT_SECRET
	});
	if (code) params.set('code', code);
	const r1 = await fetch(`${oauth}/access_token?` + params.toString());
	const access_token = new URLSearchParams(await r1.text()).get('access_token');

	// Now fetch User details
	const r2 = await fetch('https://api.github.com/user', {
		headers: {
			'User-Agent': 'svelte.dev',
			Authorization: `token ${access_token}`
		}
	});

	const profile = await r2.json();

	// Create or update user in database, and create a session

	const user = {
		github_id: profile.id,
		github_name: profile.name,
		github_login: profile.login,
		github_avatar_url: profile.avatar_url
	};
	const { sessionid, expires } = await session.create(user);

	// we can't interact directly with opener, so we use localStorage as a side channel
	return new Response(
		`<script>localStorage.setItem('${storage_key}', Date.now()); window.close()</script>`,
		{
			headers: {
				'Set-Cookie': cookie.serialize('sid', sessionid, {
					expires: new Date(expires),
					path: '/',
					httpOnly: true,
					secure: url.protocol === 'https'
				}),
				'Content-Type': 'text/html; charset=utf-8'
			}
		}
	);
}
