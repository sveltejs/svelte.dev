<script lang="ts">
	import { MediaQuery } from 'svelte/reactivity';
	import { Persisted } from '../state/Persisted.svelte';

	const preference = new Persisted<'system' | 'light' | 'dark'>('sv:theme', 'system');
	const query = new MediaQuery('prefers-color-scheme: dark');

	let system = $derived<'dark' | 'light'>(query.current ? 'dark' : 'light');
	let current = $derived(preference.current === 'system' ? system : preference.current);

	function toggle() {
		const next = current === 'light' ? 'dark' : 'light';
		preference.current = next === system ? 'system' : next;
	}

	$effect(() => {
		document.documentElement.classList.remove('light', 'dark');
		document.documentElement.classList.add(current);
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
	aria-pressed={current === 'dark'}
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
