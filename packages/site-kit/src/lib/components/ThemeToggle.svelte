<script lang="ts">
	import { on } from 'svelte/events';
	import { theme } from '../stores';

	function toggle() {
		const next = $theme.current === 'light' ? 'dark' : 'light';
		const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

		$theme.preference = next === system ? 'system' : next;
		$theme.current = next;
	}

	$effect(() => {
		if ($theme.preference === 'system') {
			const query = window.matchMedia('(prefers-color-scheme: dark)');

			return on(query, 'change', (e) => {
				$theme.current = e.matches ? 'dark' : 'light';
			});
		}
	});
</script>

<button
	onclick={toggle}
	class="raised icon"
	type="button"
	aria-pressed={$theme.current === 'dark'}
	aria-label="Toggle dark mode"
></button>

<style>
	button {
		background-image: url($lib/icons/theme-light.svg);

		:global(.dark) & {
			background-image: url($lib/icons/theme-dark.svg);
		}
	}
</style>
