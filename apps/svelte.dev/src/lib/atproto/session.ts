import type { Cookies } from '@sveltejs/kit';
import flru from 'flru';
import type { AtprotoSessionUser } from '#lib/db/types.d.ts';
import * as store from './store.js';

// Login sessions mirror the GitHub ones: an opaque id in an httpOnly cookie, the profile
// server-side. The OAuth tokens themselves live in the store under the DID (see oauth.ts).

export const COOKIE = 'atsid';
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

interface Login {
	did: string;
	expires: number;
}

const logins = store.scoped<Login>('login');
const profiles = store.scoped<AtprotoSessionUser>('profile');

// profiles cached by DID so an update reaches every session of that account
const login_cache = flru<Login | null>(1000);
const profile_cache = flru<AtprotoSessionUser>(1000);

async function login_of(sid: string) {
	if (login_cache.has(sid)) return login_cache.get(sid) ?? null;
	const login = (await logins.get(sid)) ?? null;
	login_cache.set(sid, login);
	return login;
}

async function profile_of(did: string) {
	const hit = profile_cache.get(did);
	if (hit) return hit;
	const user = (await profiles.get(did)) ?? null;
	if (user) profile_cache.set(did, user);
	return user;
}

export async function create(user: AtprotoSessionUser) {
	const sid = crypto.randomUUID();
	const login = { did: user.did, expires: Date.now() + TTL_MS };
	await profiles.set(user.did, user);
	await logins.set(sid, login);
	profile_cache.set(user.did, user);
	login_cache.set(sid, login);
	void store.sweep();
	return { sid, expires: new Date(login.expires) };
}

/** The stored profile of an account, logged in or not: it outlives the login. */
export function known(did: string) {
	return profile_of(did);
}

export async function read(sid: string | undefined): Promise<AtprotoSessionUser | null> {
	if (!sid) return null;
	const login = await login_of(sid);
	if (!login || login.expires <= Date.now()) return null;
	return profile_of(login.did);
}

export async function update(sid: string, patch: Partial<AtprotoSessionUser>) {
	const user = await read(sid);
	if (!user) return;
	const next = { ...user, ...patch };
	await profiles.set(user.did, next);
	profile_cache.set(user.did, next);
}

export async function destroy(sid: string) {
	await logins.del(sid);
	login_cache.set(sid, null);
}

export function from_cookies(cookies: Cookies) {
	return read(cookies.get(COOKIE));
}

export function set_cookie(cookies: Cookies, sid: string, expires: Date, secure: boolean) {
	cookies.set(COOKIE, sid, { path: '/', httpOnly: true, secure, expires, sameSite: 'lax' });
}

export function clear_cookie(cookies: Cookies) {
	cookies.delete(COOKIE, { path: '/' });
}
