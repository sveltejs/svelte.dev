<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { set_app_context } from './app-context';

	set_app_context({
		login: () => {
			const login_window = window.open(
				`${window.location.origin}/auth/login`,
				'login',
				'width=600,height=400'
			);

			window.addEventListener('message', function handler(event) {
				if (event.data.source !== 'svelte-auth') return;
				login_window!.close();
				window.removeEventListener('message', handler);
				invalidateAll();
			});
		},

		logout: async () => {
			const r = await fetch(`/auth/logout`);
			if (r.ok) invalidateAll();
		}
	});
</script>

<slot />
