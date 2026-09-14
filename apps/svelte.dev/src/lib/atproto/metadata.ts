import { ALL_SCOPES } from './scopes.js';

export const REDIRECT_PATH = '/auth/atproto/callback';
export const METADATA_PATH = '/auth/atproto/client-metadata.json';

/** Public client: tokens live in the browser, no server key. */
export function client_metadata(origin: string) {
	return {
		client_id: `${origin}${METADATA_PATH}`,
		client_name: 'Svelte playground',
		client_uri: origin,
		redirect_uris: [`${origin}${REDIRECT_PATH}`],
		scope: ALL_SCOPES.join(' '),
		grant_types: ['authorization_code', 'refresh_token'],
		response_types: ['code'],
		token_endpoint_auth_method: 'none',
		application_type: 'web',
		dpop_bound_access_tokens: true
	};
}

// atproto forbids `localhost`: dev must be opened on 127.0.0.1
export function loopback_client_id(origin: string) {
	const q = new URLSearchParams({
		redirect_uri: `${origin}${REDIRECT_PATH}`,
		scope: ALL_SCOPES.join(' ')
	});
	return `http://localhost?${q}`;
}
