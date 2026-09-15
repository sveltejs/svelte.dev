import type { AtprotoSessionUser } from '#lib/db/types.d.ts';

// The browser mirrors the logged-in profile into this cookie so SSR can render it.
// No secrets in it, and unverified: it only drives what we render, every write needs the token.

export const COOKIE = 'atproto';
export const RENEW_AFTER_MS = 13 * 24 * 60 * 60 * 1000;

export interface Stored extends AtprotoSessionUser {
	authorized_at: number;
}

export function from_cookie(value: string | undefined): Stored | null {
	if (!value) return null;
	try {
		const user = JSON.parse(value) as Stored;
		return user.provider === 'atproto' && user.did ? user : null;
	} catch {
		return null;
	}
}
