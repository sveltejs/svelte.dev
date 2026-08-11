<script lang="ts">
	import { refreshAll } from '$app/navigation';
	import { storage_key } from '../auth/_config';
	import { set_app_context } from './app-context';

	set_app_context({
		login: async () => {
			window.open(`${window.location.origin}/auth/login`, 'login', 'width=600,height=400');

			// we can't interact directly with opener, so we use localStorage as a side channel
			window.addEventListener('storage', function handler(event) {
				if (event.key === storage_key) {
					refreshAll();
					window.removeEventListener('storage', handler);
					this.localStorage.clearItem(storage_key);
				}
			});
		},

		logout: async () => {
			const r = await fetch(`/auth/logout`);
			if (r.ok) refreshAll();
		}
	});
</script>

<slot />
