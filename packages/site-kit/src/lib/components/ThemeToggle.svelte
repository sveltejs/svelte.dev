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
				!theme || theme === 'system'
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
	class="raised"
	type="button"
	aria-pressed={theme.current === 'dark'}
	aria-label="Toggle dark mode"
>
	<span class="icon"></span>
</button>

<style>
	.icon {
		mask-image: url(icons/theme-dark);
		mask-size: 2rem;
		:root:not(.light) & {
			@media (prefers-color-scheme: dark) {
				mask-image: url(icons/theme-light);
			}
		}

		:root.dark & {
			mask-image: url(icons/theme-light);
		}
	}
</style>
