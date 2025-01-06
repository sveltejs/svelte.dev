<script lang="ts">
	import { theme } from '../state';

	function toggle() {
		theme.current = theme.current === 'light' ? 'dark' : 'light';
	}

	$effect(() => {
		document.documentElement.classList.remove('light', 'dark');
		document.documentElement.classList.add(theme.current);
	});
</script>

<svelte:head>
	<script>
		{
			const theme = localStorage.getItem('sv:theme');

			document.documentElement.classList.add(
				theme === 'system'
					? window.matchMedia('(prefers-color-scheme: dark)').matches
						? 'dark'
						: 'light'
					: theme
			);
		}
	</script>
</svelte:head>

<button
	onclick={toggle}
	class="raised icon"
	type="button"
	aria-pressed={theme.current === 'dark'}
	aria-label="Toggle dark mode"
></button>

<style>
	button {
		background-image: url($lib/icons/theme-dark.svg);
		background-size: 2rem;

		:global(.dark) & {
			background-image: url($lib/icons/theme-light.svg);
		}
	}
</style>
