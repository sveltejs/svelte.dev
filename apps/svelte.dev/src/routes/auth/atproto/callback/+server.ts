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
	try {
		did = (await (await oauth(url.origin)).callback(url.searchParams)).did;
	} catch (e) {
		return page(
			`<h1>Login failed</h1><pre>${escape((e as Error).message)}</pre><p><a href="/auth/login/atproto">Try again</a></p>`,
			400
		);
	}

	const identity = await resolve(did);
	const bsky = await profile(identity);

	const old_sid = cookies.get(session.COOKIE);
	// one login per browser: the previous row would otherwise linger until swept
	if (old_sid) await session.destroy(old_sid);
	const { sid, expires } = await session.create({
		provider: 'atproto',
		id: did,
		did,
		handle: identity.handle,
		display_name: bsky?.display_name ?? '',
		avatar: bsky?.avatar ?? '',
		pds: identity.pds
	});
	session.set_cookie(cookies, sid, expires, url.protocol === 'https:');

	// we can't interact directly with opener, so we use localStorage as a side channel
	return page(
		`<script>localStorage.setItem('${storage_key}', Date.now()); window.close()</script>`
	);
}
