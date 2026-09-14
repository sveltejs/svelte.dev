import type { Client } from '@atcute/client';
import { PdsError } from './records.js';
import { SPACE_KEY, SPACE_TYPE, space_ref } from './scopes.js';

// `describeServer` says nothing about spaces, so we probe a method with a required
// param: XRPC validates params before auth, so a spaces PDS answers 400 and a
// stock one 401.
const PROBE_PATH = '/xrpc/com.atproto.simplespace.getSpace';
const PROBE_TIMEOUT_MS = 3000;
const TTL_MS = 10 * 60 * 1000;

const cache = new Map<string, { at: number; capable: boolean }>();

export async function pds_supports_spaces(pds: string) {
	const hit = cache.get(pds);
	if (hit && Date.now() - hit.at < TTL_MS) return hit.capable;

	let capable = false;
	try {
		const res = await fetch(`${pds}${PROBE_PATH}`, {
			signal: AbortSignal.timeout(PROBE_TIMEOUT_MS)
		});
		capable = res.status === 400;
	} catch {
		// unreachable host: treated as "no" for the TTL
	}
	cache.set(pds, { at: Date.now(), capable });
	return capable;
}

/** Idempotent: an existing space is success. Only the owner is a member. */
export async function ensure_space(client: Client) {
	const r = (await client.post(
		'com.atproto.simplespace.createSpace' as never,
		{
			input: {
				type: SPACE_TYPE,
				skey: SPACE_KEY,
				readPolicy: { $type: 'com.atproto.simplespace.defs#memberListPolicy' },
				writePolicy: { $type: 'com.atproto.simplespace.defs#memberListPolicy' },
				appAccess: { $type: 'com.atproto.simplespace.defs#open' }
			}
		} as never
	)) as unknown as { ok: boolean; status: number; data?: { error?: string; message?: string } };
	if (r.ok || r.data?.error === 'SpaceAlreadyExists') return;
	throw new PdsError('createSpace', r);
}

/** Deletes the space and every private app in it. */
export async function destroy_space(client: Client, did: string) {
	const r = (await client.post(
		'com.atproto.simplespace.deleteSpace' as never,
		{ input: { space: space_ref(did) }, as: null } as never
	)) as unknown as { ok: boolean; status: number; data?: { error?: string; message?: string } };
	if (r.ok || r.data?.error === 'SpaceNotFound') return;
	throw new PdsError('deleteSpace', r);
}
