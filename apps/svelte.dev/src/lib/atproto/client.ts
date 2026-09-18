import { createAirspace, type DidString, type Identity } from 'airspace';
import flru from 'flru';
import type { AtprotoSessionUser } from '#lib/db/types.d.ts';
import { collections, spaces } from './model.js';
import { oauth } from './oauth.js';

type Anonymous = ReturnType<typeof createAirspace<typeof collections>>;

// Anonymous clients are kept per identity for their read cache, which holds whole records:
// few of them, they only have to outlive a page load. Sessions are never reused, so a dead
// one still surfaces on the next request.
const clients = flru<Anonymous>(25);

/** Anonymous reads of someone's public repo. `who` is a handle or DID. */
export function anonymous(who: string | Identity) {
	const key = typeof who === 'string' ? who : who.did;
	let client = clients.get(key);
	if (!client) {
		client = createAirspace({ identity: who, collections, cache: { ttl: 10_000 } });
		clients.set(key, client);
	}
	return client;
}

/** After a write through the owner's own session, so their listings don't lag. Per process. */
export function invalidate_public(did: string) {
	clients.get(did)?.invalidate();
}

/** The OAuth session is gone (refresh token expired, app revoked on the PDS): the user has to log in again. */
export class SessionError extends Error {
	name = 'SessionError';
}

/** The logged-in user's own repo and space. */
export async function own(origin: string, user: Pick<AtprotoSessionUser, 'did' | 'pds'>) {
	let session;
	try {
		session = await (await oauth(origin)).restore(user.did);
	} catch (e) {
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
