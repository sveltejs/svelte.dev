<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { DESTINATION_COOKIE } from '#lib/destination.js';
	import { storage_key } from '../auth/_config';
	import { set_app_context } from './app-context';

	let { children } = $props();

	const LOGIN_TIMEOUT_MS = 2 * 60 * 1000;

	let landed: Array<() => void> = [];

	// An authorization page that sends COOP severs the popup from its opener, and `win.closed`
	// then reads true from the moment it leaves our origin: the key its callback writes right
	// before closing is the only signal a login landed, and it can arrive minutes later.
	$effect(() => {
		async function handler(event: StorageEvent) {
			if (event.key !== storage_key || !event.newValue) return;
			localStorage.removeItem(storage_key);
			await invalidateAll();
			for (const resolve of landed.splice(0)) resolve();
		}

		window.addEventListener('storage', handler);
		return () => window.removeEventListener('storage', handler);
	});

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

	async function disable_private_apps(retry = true) {
		const r = await fetch('/accounts/at/private', { method: 'DELETE' });
		if (r.ok) return invalidateAll();
		// grant predates the delete permission: re-run consent, then retry once
		if (r.status === 403 && retry) {
			try {
				await popup('/auth/login/atproto?escalate=1&delete=1');
			} catch {
				return;
			}
			return disable_private_apps(false);
		}
		alert('Could not delete the space');
	}

	set_app_context({
		login: (provider) => popup(provider === 'github' ? '/auth/login' : '/auth/login/atproto'),

		enable_private_apps: () => popup('/auth/login/atproto?escalate=1').catch(() => {}),

		disable_private_apps,

		logout: async (provider) => {
			const r = await fetch(provider === 'atproto' ? '/auth/atproto/logout' : '/auth/logout');
			if (r.ok) await invalidateAll();
		},

		set_destination: async (destination) => {
			document.cookie = `${DESTINATION_COOKIE}=${destination}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
			await invalidateAll();
		}
	});
</script>

{@render children?.()}
