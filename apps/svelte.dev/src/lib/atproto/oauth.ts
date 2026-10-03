import { createOAuth, type OAuth } from 'airspace/oauth';
import { ALL_SCOPES } from './model.js';
import * as store from './store.js';

const REDIRECT_PATH = '/auth/atproto/callback';
const METADATA_PATH = '/auth/atproto/client-metadata.json';

// Public client (no signing key): tokens are DPoP-bound and stay server-side in the store.

/** Shared with the metadata document. */
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
			// each origin is its own client: a shared slot per DID would overwrite the other's tokens
			stores: {
				state: store.scoped(`oauth-state:${origin}`),
				session: store.scoped(`oauth-session:${origin}`)
			}
		});
		clients.set(origin, client);
		// retry a failed setup on the next request
		client.catch(() => {
			if (clients.get(origin) === client) clients.delete(origin);
		});
	}
	return client;
}
