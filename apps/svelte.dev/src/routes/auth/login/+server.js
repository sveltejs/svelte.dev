import { redirect } from '@sveltejs/kit';
import { oauth } from '../_config.js';
import { GITHUB_CLIENT_ID } from '$env/static/private';

export function GET({ url }) {
	if (!GITHUB_CLIENT_ID) {
		return new Response(
			`
		<body style="font-family: sans-serif; background: rgb(255,215,215); border: 2px solid red; margin: 0; padding: 1em;">
			<h1>Missing .env file</h1>
			<p>In order to use GitHub authentication, you will need to <a target="_blank" href="https://github.com/settings/developers">register an OAuth application</a> and create a local .env file:</p>
			<pre>GITHUB_CLIENT_ID=[YOUR_APP_ID]\nGITHUB_CLIENT_SECRET=[YOUR_APP_SECRET]\nBASEURL=http://localhost:5173</pre>
			<p>The <code>BASEURL</code> variable should match the callback URL specified for your app.</p>
			<p>See also <a target="_blank" href="https://github.com/sveltejs/svelte/tree/svelte-4/sites/svelte.dev#repl-github-integration">here</a></p>
		</body>
	`,
			{
				status: 500,
				headers: {
					'Content-Type': 'text/html; charset=utf-8'
				}
			}
		);
	}

	const params = new URLSearchParams({
		scope: 'read:user',
		client_id: GITHUB_CLIENT_ID,
		redirect_uri: `${url.origin}/auth/callback`
	});

	redirect(302, `${oauth}/authorize?${params}`);
}
