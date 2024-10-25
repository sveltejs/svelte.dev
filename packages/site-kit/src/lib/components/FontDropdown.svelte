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
		<span class="current {font}"></span>
		<Icon name="chevron-down" />
	</div>

	{#snippet dropdown()}
		<div class="buttons">
			<button class="elegant" aria-pressed={font === 'elegant'} onclick={() => choose('elegant')}
				>Serif</button
			>
			<button class="boring" aria-pressed={font === 'boring'} onclick={() => choose('boring')}
				>Sans-serif</button
			>
			<button
				class="accessible"
				aria-pressed={font === 'accessible'}
				onclick={() => choose('accessible')}>Accessible</button
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
		padding: 1rem 1.3rem 1rem 3.5rem;
		line-height: 1;
		width: 100%;
		margin: 0;
		text-align: left;
		background: no-repeat 1rem 1rem;
		background-size: 1.6rem 1.6rem;

		&:hover {
			background-color: var(--sk-back-4);
		}

		&:first-child {
			background-position: 1rem 1.3rem;
			padding-top: 1.3rem;
		}

		&:last-child {
			padding-bottom: 1.3rem;
		}

		&[aria-pressed='true'] {
			color: var(--sk-theme-1);
		}
	}

	.current {
		height: 2.2rem;
		aspect-ratio: 1;
	}

	.elegant {
		background-image: url(../icons/font-elegant-light.svg);
	}

	.boring {
		background-image: url(../icons/font-boring-light.svg);
	}

	.accessible {
		background-image: url(../icons/font-accessible-light.svg);
	}

	:root.dark {
		.elegant {
			background-image: url(../icons/font-elegant-dark.svg);
		}

		.boring {
			background-image: url(../icons/font-boring-dark.svg);
		}

		.accessible {
			background-image: url(../icons/font-accessible-dark.svg);
		}
	}
</style>
