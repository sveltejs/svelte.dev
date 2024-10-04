<script lang="ts">
	import { theme } from '../stores';
	import { onDestroy } from 'svelte';

	let { label = 'Dark mode' }: { label?: string } = $props();

	function toggle() {
		const upcoming_theme = $theme.current === 'light' ? 'dark' : 'light';

		if (
			upcoming_theme ===
			(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
		) {
			// Switch the preference to `system`
			$theme.preference = 'system';
		} else {
			// Switch the preference to `light` or `dark`
			$theme.preference = upcoming_theme;
		}

		$theme.current = upcoming_theme;
	}

	const cb = (e: MediaQueryListEvent) =>
		theme.set({ preference: $theme.preference, current: e.matches ? 'dark' : 'light' });

	let query: MediaQueryList | undefined;

	$effect(() => {
		query?.removeEventListener('change', cb);

		if ($theme.preference === 'system') {
			query = window.matchMedia('(prefers-color-scheme: dark)');
			query.addEventListener('change', cb);
		}
	});

	onDestroy(() => query?.removeEventListener('change', cb));
</script>

<button
	onclick={toggle}
	type="button"
	aria-pressed={$theme.current === 'dark' ? 'true' : 'false'}
	aria-label={label}
></button>

<style>
	button {
		width: 2.3rem;
		height: 2.3rem;
		background: red;
		background: url($lib/icons/theme-light.svg) no-repeat 50% 50% / contain;
		opacity: 0.6;

		:global(.dark) & {
			background: url($lib/icons/theme-dark.svg);
			opacity: 0.8;
		}
	}
</style>
