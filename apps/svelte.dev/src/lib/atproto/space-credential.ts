import type { Client } from '@atcute/client';
import { createDpopFetch, generateDpopKey } from '@atcute/oauth-crypto';

// Reading from a space isn't done with the OAuth token: the PDS hands out a delegation
// token, exchanged at the space authority for a short-lived DPoP-bound credential.
// Writes still go through the OAuth client. Browser-only.

interface Credential {
	credential: string;
	expires_at: number;
	fetch: typeof globalThis.fetch;
}

const cache = new Map<string, Credential>();
const pending = new Map<string, Promise<Credential>>();
const JWT_B64URL_PLUS = /-/g;
const JWT_B64URL_SLASH = /_/g;

function jwt_expiry(jwt: string) {
	try {
		const encoded = jwt.split('.')[1];
		const padded = encoded
			.replace(JWT_B64URL_PLUS, '+')
			.replace(JWT_B64URL_SLASH, '/')
			.padEnd(Math.ceil(encoded.length / 4) * 4, '=');
		const { exp } = JSON.parse(atob(padded));
		return typeof exp === 'number' ? exp * 1000 : undefined;
	} catch {
		return undefined;
	}
}

async function acquire(client: Client, space: string, host: string): Promise<Credential> {
	const [key, delegation] = await Promise.all([
		generateDpopKey(['ES256']),
		client.get(
			'com.atproto.space.getDelegationToken' as never,
			{
				params: { space }
			} as never
		) as unknown as Promise<{ ok: boolean; status: number; data: { token?: string } }>
	]);
	if (!delegation.ok || !delegation.data.token) {
		throw new Error(`getDelegationToken: PDS answered ${delegation.status}`);
	}

	const nonces = new Map<string, string>();
	const dpop_fetch = createDpopFetch({
		key,
		nonces: {
			get: (origin) => nonces.get(origin),
			set: (origin, nonce) => {
				nonces.set(origin, nonce);
			}
		}
	});

	const res = await dpop_fetch(new URL('/xrpc/com.atproto.space.getSpaceCredential', host), {
		method: 'POST',
		headers: {
			accept: 'application/json',
			authorization: `Bearer ${delegation.data.token}`,
			'content-type': 'application/json'
		},
		body: JSON.stringify({ space })
	});
	const data = await res.json().catch(() => ({}));
	if (!res.ok || typeof data.credential !== 'string') {
		throw new Error(
			`getSpaceCredential: ${res.status} ${data.error ?? ''} ${data.message ?? ''}`.trim()
		);
	}

	return {
		credential: data.credential,
		expires_at: jwt_expiry(data.credential) ?? Date.now() + 60 * 60 * 1000,
		fetch: dpop_fetch
	};
}

async function credential(client: Client, did: string, space: string, host: string) {
	const key = `${did}\n${space}`;
	const hit = cache.get(key);
	if (hit && hit.expires_at > Date.now() + 30_000) return hit;
	cache.delete(key);

	let request = pending.get(key);
	if (!request) {
		request = acquire(client, space, host).finally(() => pending.delete(key));
		pending.set(key, request);
	}
	const c = await request;
	cache.set(key, c);
	return c;
}

export function forget(did: string) {
	for (const key of cache.keys()) if (key.startsWith(`${did}\n`)) cache.delete(key);
}

/** GET an xrpc method on the space authority with the space credential. */
export async function query<T>(
	client: Client,
	{ did, space, host }: { did: string; space: string; host: string },
	method: string,
	params: Record<string, string | number | undefined>
): Promise<{ ok: true; data: T } | { ok: false; status: number; data?: any }> {
	const c = await credential(client, did, space, host);
	const url = new URL(`/xrpc/${method}`, host);
	for (const [k, v] of Object.entries(params))
		if (v !== undefined) url.searchParams.set(k, String(v));

	const res = await c.fetch(url, {
		headers: { accept: 'application/json', authorization: `DPoP ${c.credential}` }
	});
	const data = await res.json().catch(() => undefined);
	return res.ok ? { ok: true, data } : { ok: false, status: res.status, data };
}
