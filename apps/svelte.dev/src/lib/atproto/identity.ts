import type { ActorIdentifier } from '@atcute/lexicons';
import {
	CompositeDidDocumentResolver,
	CompositeHandleResolver,
	DohJsonHandleResolver,
	LocalActorResolver,
	PlcDidDocumentResolver,
	WebDidDocumentResolver,
	WellKnownHandleResolver
} from '@atcute/identity-resolver';

const DOH_RESOLVER = 'https://mozilla.cloudflare-dns.com/dns-query';

const DID_REGEX = /^did:[a-z]+:[A-Za-z0-9._:%-]+$/;

export function is_did(s: string) {
	return DID_REGEX.test(s);
}

export interface Identity {
	did: string;
	handle: string;
	pds: string;
}

const cache = new Map<string, { at: number; identity: Identity }>();
const TTL_MS = 10 * 60 * 1000;

let resolver: LocalActorResolver | null = null;

function create_actor_resolver() {
	return new LocalActorResolver({
		handleResolver: new CompositeHandleResolver({
			methods: {
				dns: new DohJsonHandleResolver({ dohUrl: DOH_RESOLVER }),
				http: new WellKnownHandleResolver()
			}
		}),
		didDocumentResolver: new CompositeDidDocumentResolver({
			methods: {
				plc: new PlcDidDocumentResolver(),
				web: new WebDidDocumentResolver()
			}
		})
	});
}

/** Resolve a handle or DID to { did, handle, pds }. Cached per identifier for 10 minutes. */
export async function resolve(actor: string): Promise<Identity> {
	const hit = cache.get(actor);
	if (hit && Date.now() - hit.at < TTL_MS) return hit.identity;

	resolver ??= create_actor_resolver();
	const resolved = await resolver.resolve(actor as ActorIdentifier);
	const identity = {
		did: resolved.did,
		handle: resolved.handle,
		pds: new URL(resolved.pds).origin
	};
	cache.set(actor, { at: Date.now(), identity });
	cache.set(identity.did, { at: Date.now(), identity });
	return identity;
}

export interface Profile {
	display_name: string;
	avatar: string;
}

const profiles = new Map<string, { at: number; profile: Profile | null }>();

/** Bluesky profile read straight from the PDS. Null for accounts without one. */
export async function profile({ did, pds }: Identity): Promise<Profile | null> {
	const hit = profiles.get(did);
	if (hit && Date.now() - hit.at < TTL_MS) return hit.profile;

	try {
		const params = new URLSearchParams({
			repo: did,
			collection: 'app.bsky.actor.profile',
			rkey: 'self'
		});
		const res = await fetch(`${pds}/xrpc/com.atproto.repo.getRecord?${params}`, {
			signal: AbortSignal.timeout(5000)
		});
		// 400 RecordNotFound is a real answer (no profile), anything else is a hiccup
		if (res.status !== 200 && res.status !== 400) throw new Error(`${res.status}`);
		let profile: Profile | null = null;
		if (res.ok) {
			const { value } = await res.json();
			const cid = value.avatar?.ref?.$link;
			profile = {
				display_name: value.displayName ?? '',
				avatar: cid ? `${pds}/xrpc/com.atproto.sync.getBlob?did=${did}&cid=${cid}` : ''
			};
		}
		profiles.set(did, { at: Date.now(), profile });
		return profile;
	} catch (e) {
		console.warn(`profile ${did}: ${(e as Error).message}`);
		// serve the last known profile rather than an empty one
		return hit?.profile ?? null;
	}
}
