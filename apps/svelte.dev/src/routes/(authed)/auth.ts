import { refreshAll } from '$app/navigation';
import { storage_key } from '../auth/_config';

// Browser-only: these run from clicks, so module state is never shared between requests.

type Provider = 'github' | 'atproto';

const LOGIN_TIMEOUT_MS = 2 * 60 * 1000;

let landed: Array<() => void> = [];

/** Resolves once the login lands, rejects when the popup is blocked or nothing comes back. */
function popup(path: string) {
	localStorage.removeItem(storage_key);
	const win = window.open(`${window.location.origin}${path}`, 'login', 'width=600,height=500');
	if (!win) return Promise.reject(new Error('The login popup was blocked'));

	return new Promise<void>((resolve, reject) => {
		const timeout = setTimeout(() => {
			landed = landed.filter((fn) => fn !== done);
			reject(new Error('Login timed out'));
		}, LOGIN_TIMEOUT_MS);

		function done() {
			clearTimeout(timeout);
			resolve();
		}

		landed.push(done);
	});
}

/**
 * For `<svelte:window onstorage>`. An authorization page that sends COOP severs the popup from
 * its opener, and `win.closed` then reads true from the moment it leaves our origin: the key its
 * callback writes right before closing is the only signal a login landed, and it can arrive
 * minutes later.
 */
export async function on_storage(event: StorageEvent) {
	if (event.key !== storage_key || !event.newValue) return;
	localStorage.removeItem(storage_key);
	await refreshAll();
	for (const resolve of landed.splice(0)) resolve();
}

/** `actor` prefills the handle, for logging back in after a session expired. */
export function login_path(provider: Provider, actor?: string) {
	if (provider === 'github') return '/auth/login';
	return actor ? `/auth/login/atproto?${new URLSearchParams({ actor })}` : '/auth/login/atproto';
}

export function login(provider: Provider, actor?: string) {
	return popup(login_path(provider, actor));
}

export async function logout(provider: Provider) {
	const r = await fetch(provider === 'atproto' ? '/auth/atproto/logout' : '/auth/logout', {
		method: 'POST'
	});
	if (r.ok) await refreshAll();
}

export function enable_private_apps() {
	return popup('/auth/atproto/authorize?escalate=1').catch(() => {});
}

export function disable_private_apps() {
	return delete_space(true);
}

async function delete_space(retry: boolean): Promise<void> {
	const r = await fetch('/accounts/at/private', { method: 'DELETE' });
	if (r.ok) return refreshAll();
	// grant predates the delete permission: re-run consent, then retry once
	if (r.status === 403 && retry) {
		try {
			await popup('/auth/atproto/authorize?escalate=1&delete=1');
		} catch {
			return;
		}
		return delete_space(false);
	}
	alert('Could not delete the space');
}
