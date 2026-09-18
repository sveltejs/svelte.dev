import { own } from '#lib/atproto/client.js';
import { enable_private } from '#lib/atproto/apps.js';
import { profile, resolve } from '#lib/atproto/identity.js';
import { oauth } from '#lib/atproto/oauth.js';
import * as session from '#lib/atproto/session.js';
import { storage_key } from '../../_config.js';

const HTML_SPECIAL_REGEX = /[&<>"']/g;
const HTML_ESCAPES: Record<string, string> = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;'
};

// the OAuth library echoes callback params (`state`, `error_description`) into its messages
function escape(s: string) {
	return s.replace(HTML_SPECIAL_REGEX, (c) => HTML_ESCAPES[c]);
}

function page(body: string, status = 200) {
	return new Response(body, { status, headers: { 'content-type': 'text/html; charset=utf-8' } });
}

export async function GET({ url, cookies }) {
	let did: string;
	let wants_private = false;
	try {
		const result = await (await oauth(url.origin)).callback(url.searchParams);
		did = result.did;
		wants_private = !!result.state && JSON.parse(result.state).private_apps === true;
	} catch (e) {
		return page(
			`<h1>Login failed</h1><pre>${escape((e as Error).message)}</pre><p><a href="/auth/login/atproto">Try again</a></p>`,
			400
		);
	}

	const identity = await resolve(did);
	const airspace = await own(url.origin, identity);
	const [bsky, spaces_supported] = await Promise.all([
		profile(identity),
		airspace.private_apps.supported()
	]);

	const existing = await session.from_cookies(cookies);
	let private_apps = existing?.did === did ? existing.private_apps : false;
	if (wants_private && spaces_supported) {
		try {
			await enable_private(airspace);
			private_apps = true;
		} catch (e) {
			// the grant came back without the space scope: log in without private apps
			console.warn(`space for ${did}: ${(e as Error).message}`);
			private_apps = false;
		}
	}

	const { sid, expires } = await session.create({
		provider: 'atproto',
		id: did,
		did,
		handle: identity.handle,
		display_name: bsky?.display_name ?? '',
		avatar: bsky?.avatar ?? '',
		pds: identity.pds,
		spaces_supported,
		private_apps
	});
	session.set_cookie(cookies, sid, expires, url.protocol === 'https:');

	// we can't interact directly with opener, so we use localStorage as a side channel
	return page(
		`<script>localStorage.setItem('${storage_key}', Date.now()); window.close()</script>`
	);
}
