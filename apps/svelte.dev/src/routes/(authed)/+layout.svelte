<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import * as atproto from '#lib/atproto/auth.js';
	import { destroy_space } from '#lib/atproto/space.js';
	import { DESTINATION_COOKIE } from '#lib/destination.js';
	import { storage_key } from '../auth/_config';
	import { set_app_context } from './app-context';

	function popup(path: string) {
		window.open(`${window.location.origin}${path}`, 'login', 'width=600,height=500');

		return new Promise<void>((resolve) => {
			// we can't interact directly with opener, so we use localStorage as a side channel
			window.addEventListener('storage', function handler(event) {
				if (event.key === storage_key) {
					window.removeEventListener('storage', handler);
					this.localStorage.removeItem(storage_key);
					invalidateAll().then(resolve);
				}
			});
		});
	}

	async function disable_private_apps(retry = true) {
		const user = atproto.current();
		if (!user) return;
		try {
			await destroy_space(await atproto.own_client(user.did), user.did);
		} catch (e) {
			// grant predates the delete permission: re-run consent, then retry once
			if (retry && (e as Error).message.includes('ScopeMissingError')) {
				await popup('/auth/login/atproto?escalate=1&delete=1');
				return disable_private_apps(false);
			}
			return alert('Could not delete the space');
		}
		atproto.update({ private_apps: false });
		await invalidateAll();
	}

	set_app_context({
		login: (provider) => popup(provider === 'github' ? '/auth/login' : '/auth/login/atproto'),

		enable_private_apps: () => popup('/auth/login/atproto?escalate=1'),

		disable_private_apps: () => disable_private_apps(),

		logout: async (provider) => {
			if (provider === 'atproto') {
				await atproto.logout();
			} else {
				const r = await fetch(`/auth/logout`);
				if (!r.ok) return;
			}
			await invalidateAll();
		},

		set_destination: async (destination) => {
			document.cookie = `${DESTINATION_COOKIE}=${destination}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
			await invalidateAll();
		}
	});
</script>

<slot />
