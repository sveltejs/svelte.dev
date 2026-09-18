import { createOAuth, type OAuth } from 'airspace/oauth';
import { ALL_SCOPES } from './model.js';
import * as store from './store.js';

export const REDIRECT_PATH = '/auth/atproto/callback';
export const METADATA_PATH = '/auth/atproto/client-metadata.json';

// Public client (no signing key): tokens are DPoP-bound and kept server-side in the store.
// atproto forbids `localhost` as a loopback origin: dev must be opened on 127.0.0.1.

const clients = new Map<string, Promise<OAuth>>();

export function oauth(origin: string) {
	let client = clients.get(origin);
	if (!client) {
		client = createOAuth({
			baseUrl: origin,
			redirectPath: REDIRECT_PATH,
			metadataPath: METADATA_PATH,
			name: 'Svelte playground',
			scopes: ALL_SCOPES,
			stores: {
				state: store.scoped('oauth-state'),
				session: store.scoped('oauth-session')
			}
		});
		clients.set(origin, client);
	}
	return client;
}
