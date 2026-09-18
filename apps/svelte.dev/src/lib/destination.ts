import type { Accounts } from './db/types.d.ts';

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

export function account_for(destination: Destination, accounts: Accounts) {
	return destination === 'github' ? accounts.github : accounts.atproto;
}

export function provider_of(destination: Destination): 'github' | 'atproto' {
	return destination === 'github' ? 'github' : 'atproto';
}

/** Where an app currently lives. */
export function home_of(gist: { id: string; private?: boolean }): Destination {
	if (!gist.id.includes('/')) return 'github';
	return gist.private ? 'atproto-private' : 'atproto-public';
}
