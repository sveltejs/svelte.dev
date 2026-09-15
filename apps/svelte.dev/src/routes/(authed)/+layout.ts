import { browser } from '$app/env';
import * as atproto from '#lib/atproto/auth.js';
import { resolve_destination } from '#lib/destination.js';

// The server trusts the profile cookie; the browser reconciles it with the tokens it holds
export function load({ data }) {
	if (!browser) return data;

	const live = atproto.current();
	if ((live?.did ?? null) === (data.accounts.atproto?.did ?? null)) return data;

	const accounts = { ...data.accounts, atproto: live };
	return {
		accounts,
		destination: resolve_destination(data.destination, accounts),
		renew_atproto: live ? atproto.needs_renewal() : false
	};
}
