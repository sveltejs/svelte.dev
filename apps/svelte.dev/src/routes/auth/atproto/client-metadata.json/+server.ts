import { oauth } from '#lib/atproto/oauth.js';

export async function GET({ url }) {
	return Response.json((await oauth(url.origin)).metadata);
}
