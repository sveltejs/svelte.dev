import type { DidString } from 'airspace';
import flru from 'flru';
import { anonymous } from './client.js';

const TTL_MS = 10 * 60 * 1000;

interface Cached<T> {
	at: number;
	value: T;
}

// flru bounds the size, `at` bounds the age
function fresh<T>(hit: Cached<T> | undefined) {
	return hit && Date.now() - hit.at < TTL_MS ? hit : undefined;
}

export interface Resolved {
	did: string;
	handle: string;
	pds: string;
}

const identities = flru<Cached<Resolved>>(2000);

/** Handle or DID to { did, handle, pds }, cached for 10 minutes. */
export async function resolve(actor: string): Promise<Resolved> {
	const hit = fresh(identities.get(actor));
	if (hit) return hit.value;

	const identity = await anonymous(actor).identity();
	const value = {
		did: identity.did,
		handle: identity.handle ?? identity.did,
		pds: identity.service
	};
	identities.set(actor, { at: Date.now(), value });
	identities.set(value.did, { at: Date.now(), value });
	return value;
}

export interface Profile {
	display_name: string;
	avatar: string;
}

const profiles = flru<Cached<Profile | null>>(2000);

/** Bluesky profile, read from the PDS. Null for accounts without one. */
export async function profile({ did, pds }: Resolved): Promise<Profile | null> {
	const hit = profiles.get(did);
	const live = fresh(hit);
	if (live) return live.value;

	try {
		const airspace = anonymous({ did: did as DidString, service: pds });
		const record = await airspace.resolve(`at://${did}/app.bsky.actor.profile/self`);
		const bsky = record?.value as { displayName?: string; avatar?: unknown } | undefined;
		const value = bsky
			? {
					display_name: bsky.displayName ?? '',
					avatar: (await airspace.blobs.url(bsky.avatar)) ?? ''
				}
			: null;
		profiles.set(did, { at: Date.now(), value });
		return value;
	} catch (e) {
		console.warn(`profile ${did}: ${(e as Error).message}`);
		// serve the last known profile rather than an empty one
		return hit?.value ?? null;
	}
}
