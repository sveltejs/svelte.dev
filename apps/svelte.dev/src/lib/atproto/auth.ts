import { dev } from '$app/env';
import { Client } from '@atcute/client';
import type { ActorIdentifier, Did } from '@atcute/lexicons';
import {
	OAuthUserAgent,
	TokenRefreshError,
	configureOAuth,
	createAuthorizationUrl,
	deleteStoredSession,
	finalizeAuthorization,
	getSession,
	listStoredSessions
} from '@atcute/oauth-browser-client';
import type { AtprotoSessionUser } from '#lib/db/types.d.ts';
import { METADATA_PATH, REDIRECT_PATH, loopback_client_id } from './metadata.js';
import { COOKIE, RENEW_AFTER_MS, type Stored } from './profile.js';
import { scopes_for } from './scopes.js';
import { ensure_space } from './space.js';
import { forget } from './space-credential.js';

// Browser-only. Tokens live in localStorage (atcute). The profile is kept next to them and
// mirrored in a cookie (no secrets) so the server can render the logged-in state.
// Public client: the PDS caps the session at ~2 weeks, so we nudge for a renewal before that.

const USER_KEY = 'atproto-user';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export interface Identity {
	did: string;
	handle: string;
	pds: string;
	display_name: string;
	avatar: string;
	spaces_supported: boolean;
}

let configured = false;

function configure() {
	if (configured) return;
	configured = true;
	const origin = location.origin;
	configureOAuth({
		metadata: {
			client_id: dev ? loopback_client_id(origin) : `${origin}${METADATA_PATH}`,
			redirect_uri: `${origin}${REDIRECT_PATH}`
		},
		identityResolver: { resolve: (actor) => identity(actor) as Promise<any> }
	});
}

export async function identity(actor: string): Promise<Identity> {
	const r = await fetch(`/auth/atproto/identity?actor=${encodeURIComponent(actor)}`);
	if (!r.ok) throw new Error((await r.text()) || `Could not resolve ${actor}`);
	return r.json();
}

function read(): Stored | null {
	try {
		const raw = localStorage.getItem(USER_KEY);
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
}

function write(user: Stored) {
	const json = JSON.stringify(user);
	localStorage.setItem(USER_KEY, json);
	document.cookie = `${COOKIE}=${encodeURIComponent(json)}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
}

function clear() {
	localStorage.removeItem(USER_KEY);
	document.cookie = `${COOKIE}=; path=/; max-age=0`;
}

/** The logged-in account, if its tokens are still around; otherwise forget it. */
export function current(): AtprotoSessionUser | null {
	const user = read();
	if (!user) return null;
	configure();
	if (!listStoredSessions().includes(user.did as Did)) {
		clear();
		return null;
	}
	// sessions from before the cookie existed
	if (!document.cookie.includes(`${COOKIE}=`)) write(user);
	const { authorized_at, ...rest } = user;
	return rest;
}

export function needs_renewal() {
	const user = read();
	return !!user && Date.now() - user.authorized_at > RENEW_AFTER_MS;
}

export function update(patch: Partial<AtprotoSessionUser>) {
	const user = read();
	if (user) write({ ...user, ...patch });
}

export async function authorize_url(
	actor: string,
	{ private_apps = false, can_delete = false } = {}
) {
	configure();
	const url = await createAuthorizationUrl({
		target: { type: 'account', identifier: actor as ActorIdentifier },
		scope: scopes_for(private_apps, can_delete),
		state: { private_apps },
		display: 'popup'
	});
	// let the browser flush the PKCE state to localStorage before we leave
	await new Promise((f) => setTimeout(f, 200));
	return url;
}

export async function finalize(params: URLSearchParams) {
	configure();
	const { session, state } = await finalizeAuthorization(params);
	const did = session.info.sub;
	const wants_private = (state as { private_apps?: boolean } | null)?.private_apps === true;

	const id = await identity(did);
	const existing = read();
	let private_apps = existing?.did === did ? existing.private_apps : false;
	if (wants_private && id.spaces_supported) {
		await ensure_space(new Client({ handler: new OAuthUserAgent(session) }));
		private_apps = true;
	}

	write({
		provider: 'atproto',
		id: did,
		did,
		handle: id.handle,
		display_name: id.display_name,
		avatar: id.avatar,
		pds: id.pds,
		spaces_supported: id.spaces_supported,
		private_apps,
		authorized_at: Date.now()
	});
}

export async function logout() {
	const user = read();
	clear();
	if (!user) return;
	forget(user.did);
	configure();
	const did = user.did as Did;
	try {
		const session = await getSession(did, { allowStale: true });
		await new OAuthUserAgent(session).signOut();
	} catch {
		deleteStoredSession(did);
	}
}

/** Authenticated client on the user's own PDS. Refreshes tokens as needed. */
export async function own_client(did: string) {
	configure();
	const session = await getSession(did as Did, { allowStale: true });
	return new Client({ handler: new OAuthUserAgent(session) });
}

export function is_auth_error(e: unknown) {
	if (e instanceof TokenRefreshError) return true;
	return e instanceof Error && 'status' in e && e.status === 401;
}
