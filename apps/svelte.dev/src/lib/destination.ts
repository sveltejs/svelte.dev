import type { Accounts, UserID } from './db/types.d.ts';

export type Destination = 'github' | 'atproto-public' | 'atproto-private';

export const DESTINATION_COOKIE = 'save_to';

export const DESTINATIONS: Array<{ id: Destination; label: string }> = [
	{ id: 'atproto-public', label: 'Atmosphere public' },
	{ id: 'atproto-private', label: 'Atmosphere private' },
	{ id: 'github', label: 'GitHub' }
];

export function is_destination(s: unknown): s is Destination {
	return DESTINATIONS.some((d) => d.id === s);
}

export function available(destination: Destination, accounts: Accounts) {
	if (destination === 'github') return !!accounts.github;
	if (destination === 'atproto-public') return !!accounts.atproto;
	return !!accounts.atproto?.private_apps;
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

type App = { id: string; owner: UserID | null; private?: boolean };

/** Where an app currently lives. */
export function home_of(gist: Pick<App, 'id' | 'private'>): Destination {
	if (!gist.id.includes('/')) return 'github';
	return gist.private ? 'atproto-private' : 'atproto-public';
}

/** The logged-in account behind the app's home is the app's owner. */
export function is_owner(accounts: Accounts, gist: App) {
	return account_for(home_of(gist), accounts)?.id === gist.owner;
}
