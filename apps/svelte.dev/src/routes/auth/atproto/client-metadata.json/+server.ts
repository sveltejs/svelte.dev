import { client_options } from '#lib/atproto/oauth.js';
import { clientMetadata } from 'airspace/oauth/metadata';

// the document is a pure function of the options: no OAuth client needed to serve it
export async function GET({ url }) {
	return Response.json(clientMetadata(client_options(url.origin)));
}
