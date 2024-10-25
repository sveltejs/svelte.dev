<script lang="ts">
	import Dropdown from './Dropdown.svelte';
	import Icon from './Icon.svelte';

	let { top = false }: { top?: boolean } = $props();

	let font = $state('elegant');

	$effect(() => {
		font = localStorage.getItem('svelte:font') ?? 'elegant';
	});

	function choose(value: 'elegant' | 'boring' | 'accessible') {
		console.log('choosing', value);

		font = value;

		document.documentElement.classList.remove('font-elegant');
		document.documentElement.classList.remove('font-boring');
		document.documentElement.classList.remove('font-accessible');

		document.documentElement.classList.add(`font-${font}`);
		localStorage.setItem('svelte:font', font);
	}
</script>

<Dropdown align="right" {top}>
	<div class="icons">
		<Icon name="font-toggle" />
		<Icon name="chevron-down" />
	</div>

	{#snippet dropdown()}
		<div class="buttons">
			<button aria-pressed={font === 'elegant'} onclick={() => choose('elegant')}>Serif</button>
			<button aria-pressed={font === 'boring'} onclick={() => choose('boring')}>Sans-serif</button>
			<button aria-pressed={font === 'accessible'} onclick={() => choose('accessible')}
				>Accessible</button
			>
		</div>
	{/snippet}
</Dropdown>

<style>
	.icons {
		height: 100%;
		display: flex;
		align-items: center;
	}

	button {
		display: block;
		font: var(--sk-font-ui-medium);
		padding: 1rem 1.3rem;
		line-height: 1;
		width: 100%;
		margin: 0;
		text-align: left;

		&:hover {
			background-color: var(--sk-back-4);
		}

		&:first-child {
			padding-top: 1.3rem;
		}

		&:last-child {
			padding-bottom: 1.3rem;
		}

		&[aria-pressed='true'] {
			color: var(--sk-theme-1);
		}
	}
</style>
