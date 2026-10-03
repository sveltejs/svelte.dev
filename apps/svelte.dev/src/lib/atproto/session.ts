import type { Cookies } from '@sveltejs/kit';
import flru from 'flru';
import type { AtprotoSessionUser } from '#lib/db/types.d.ts';
import * as store from './store.js';

// Login sessions mirror the GitHub ones: an opaque id in an httpOnly cookie, the profile
// server-side. The OAuth tokens themselves live in the store under the DID (see oauth.ts).

export const COOKIE = 'atsid';
const TTL_MS = 30 * 24 * 60 * 60 * 1000;
const LOGIN_CACHE_MS = 60 * 1000;

interface Login {
	did: string;
	expires: number;
}

const logins = store.scoped<Login>('login');
const profiles = store.scoped<AtprotoSessionUser>('profile');

// Per-instance caches never see writes made on other instances. A login only changes on
// logout, so a short TTL is enough; profiles (private apps, handle, PDS) are never cached.
const login_cache = flru<{ at: number; login: Login | null }>(1000);

async function login_of(sid: string) {
	const hit = login_cache.get(sid);
	if (hit && Date.now() - hit.at < LOGIN_CACHE_MS) return hit.login;
	const login = (await logins.get(sid)) ?? null;
	login_cache.set(sid, { at: Date.now(), login });
	return login;
}

async function profile_of(did: string) {
	return (await profiles.get(did)) ?? null;
}

export async function create(user: AtprotoSessionUser) {
	const sid = crypto.randomUUID();
	const login = { did: user.did, expires: Date.now() + TTL_MS };
	await profiles.set(user.did, user);
	await logins.set(sid, login);
	login_cache.set(sid, { at: Date.now(), login });
	// awaited: work left running after the response may be frozen on serverless
	await store.sweep();
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
}

export async function destroy(sid: string) {
	await logins.del(sid);
	login_cache.set(sid, { at: Date.now(), login: null });
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
