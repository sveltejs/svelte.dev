import { createOAuth, type OAuth } from 'airspace/oauth';
import { ALL_SCOPES } from './model.js';
import * as store from './store.js';

const REDIRECT_PATH = '/auth/atproto/callback';
const METADATA_PATH = '/auth/atproto/client-metadata.json';

// Public client (no signing key): tokens are DPoP-bound and kept server-side in the store.
// atproto forbids `localhost` as a loopback origin: dev must be opened on 127.0.0.1.

/** What the client is, shared with the metadata document served at METADATA_PATH. */
export function client_options(origin: string) {
	return {
		baseUrl: origin,
		redirectPath: REDIRECT_PATH,
		metadataPath: METADATA_PATH,
		name: 'Svelte playground',
		scopes: ALL_SCOPES
	};
}

const MAX_ORIGINS = 20;
const clients = new Map<string, Promise<OAuth>>();

export function oauth(origin: string) {
	let client = clients.get(origin);
	if (!client) {
		// keyed by the Host header: capped, oldest dropped first
		if (clients.size >= MAX_ORIGINS) clients.delete(clients.keys().next().value!);
		client = createOAuth({
			...client_options(origin),
			// each origin is its own OAuth client: sharing a DID's slot would let one overwrite
			// the other's tokens, and the next refresh would drop the session
			stores: {
				state: store.scoped(`oauth-state:${origin}`),
				session: store.scoped(`oauth-session:${origin}`)
			}
		});
		clients.set(origin, client);
		// a failed setup is retried on the next request, not kept for the life of the instance
		client.catch(() => {
			if (clients.get(origin) === client) clients.delete(origin);
		});
	}
	return client;
}
