import { client_options } from '#lib/atproto/oauth.js';
import { clientMetadata } from 'airspace/oauth/metadata';

// no OAuth client needed: the document only depends on the options
export async function GET({ url }) {
	return Response.json(clientMetadata(client_options(url.origin)));
}
