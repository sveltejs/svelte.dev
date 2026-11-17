import type { Accounts, UserID } from './db/types.d.ts';

export type Destination = 'github' | 'atproto-public';

export const DESTINATION_COOKIE = 'save_to';

export const DESTINATIONS: Array<{ id: Destination; label: string }> = [
	{ id: 'atproto-public', label: 'Atmosphere public' },
	{ id: 'github', label: 'GitHub' }
];

export function is_destination(s: unknown): s is Destination {
	return DESTINATIONS.some((d) => d.id === s);
}

export function available(destination: Destination, accounts: Accounts) {
	return !!account_for(destination, accounts);
}

/** The stored choice if usable, else the first usable one. */
export function resolve_destination(stored: unknown, accounts: Accounts): Destination | null {
	if (is_destination(stored) && available(stored, accounts)) return stored;
	return DESTINATIONS.find((d) => available(d.id, accounts))?.id ?? null;
}

export function provider_of(destination: Destination): 'github' | 'atproto' {
	return destination === 'github' ? 'github' : 'atproto';
}

export function account_for(destination: Destination, accounts: Accounts) {
	return accounts[provider_of(destination)];
}

type App = { id: string; owner: UserID | null };

export function home_of(gist: Pick<App, 'id'>): Destination {
	return gist.id.includes('/') ? 'atproto-public' : 'github';
}

export function is_owner(accounts: Accounts, gist: App) {
	return account_for(home_of(gist), accounts)?.id === gist.owner;
}
