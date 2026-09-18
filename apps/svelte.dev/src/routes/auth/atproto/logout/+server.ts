import { oauth } from '#lib/atproto/oauth.js';
import * as session from '#lib/atproto/session.js';

export async function GET({ url, cookies }) {
	const sid = cookies.get(session.COOKIE);
	const user = await session.read(sid);
	if (sid) await session.destroy(sid);
	session.clear_cookie(cookies);
	if (user) {
		try {
			await (await oauth(url.origin)).revoke(user.did);
		} catch {
			// the PDS may already have dropped the tokens
		}
	}
	return new Response(undefined, { status: 204 });
}
