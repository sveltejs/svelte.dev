import { isExpectedSessionError } from '@atproto/oauth-client-node';
import { createAirspace, type DidString, type Identity } from 'airspace';
import flru from 'flru';
import type { AtprotoSessionUser } from '#lib/db/types.d.ts';
import { collections, spaces } from './model.js';
import { oauth } from './oauth.js';

type Anonymous = ReturnType<typeof createAirspace<typeof collections>>;

// Anonymous clients are kept for their read cache (whole records, so few). Sessions are
// never reused, so a dead one still surfaces on the next request.
const clients = flru<{ service: string; client: Anonymous }>(25);

export function anonymous(who: Identity) {
	const hit = clients.get(who.did);
	// a client pins its PDS: an account that moved gets a new one
	if (hit?.service === who.service) return hit.client;
	const client = createAirspace({ identity: who, collections, cache: { ttl: 10_000 } });
	clients.set(who.did, { service: who.service, client });
	return client;
}

/** Never cached: a client resolves its identity once. */
export function lookup(actor: string) {
	return createAirspace({ identity: actor }).identity();
}

/** After the owner writes, so their listings don't lag. Per process. */
export function invalidate_public(did: string) {
	clients.get(did)?.client.invalidate();
}

/** Refresh token expired or app revoked on the PDS: log in again. */
export class SessionError extends Error {
	name = 'SessionError';
}

export async function own(origin: string, user: Pick<AtprotoSessionUser, 'did' | 'pds'>) {
	let session;
	try {
		session = await (await oauth(origin)).restore(user.did);
	} catch (e) {
		// a refresh that failed on the network is not a revoked grant: keep the login
		if (!isExpectedSessionError(e)) throw e;
		throw new SessionError((e as Error).message, { cause: e });
	}
	return createAirspace({
		identity: { did: user.did as DidString, service: user.pds },
		collections,
		spaces,
		session
	});
}

export type Airspace = Awaited<ReturnType<typeof own>>;
