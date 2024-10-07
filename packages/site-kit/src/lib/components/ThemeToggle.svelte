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

<div class="appearance">
	<span class="caption">Theme</span>
	<button
		onclick={toggle}
		class="raised"
		type="button"
		aria-pressed={$theme.current === 'dark' ? 'true' : 'false'}
		aria-label={label}
	></button>
</div>

<style>
	button {
		width: 3.2rem;
		aspect-ratio: 1;
		background: red;
		background: url($lib/icons/theme-light.svg) no-repeat 50% 50% / 2.3rem 2.3rem;
		opacity: 0.6;

		:global(.dark) & {
			background-image: url($lib/icons/theme-dark.svg);
			opacity: 0.8;
		}
	}

	.appearance {
		display: flex;
		align-items: center;

		.caption {
			display: none;
			font-size: var(--sk-text-xs);
			line-height: 1;
			margin-right: 0rem;
		}
	}

	@media (max-width: 799px) {
		.appearance {
			position: relative;
			display: flex;
			padding: 1.5rem 0;
			justify-content: space-between;
		}

		.appearance .caption {
			display: block;

			font-size: var(--sk-text-s);
		}
	}
</style>
