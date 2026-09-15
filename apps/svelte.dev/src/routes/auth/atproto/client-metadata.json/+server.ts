import { client_metadata } from '#lib/atproto/metadata.js';

export const prerender = false;

export function GET({ url }) {
	return Response.json(client_metadata(url.origin));
}
