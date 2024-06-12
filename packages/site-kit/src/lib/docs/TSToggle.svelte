<script>
	import { persisted } from 'svelte-persisted-store';
	import ToggleButton from '../components/ToggleButton.svelte';

	/** @type {{javascript?: import('svelte').Snippet, typescript?: import('svelte').Snippet}} */
	let { javascript, typescript } = $props();

	const checked = persisted('svelte:prefers-ts', false);

	$effect(() => {
		document.body.classList.toggle('prefers-ts', $checked);
	});
</script>

<div class="input-output-toggle">
	<span aria-hidden="true">
		{#if javascript}{@render javascript()}{:else}JavaScript{/if}
	</span>
	<ToggleButton bind:pressed={$checked} label="TypeScript code examples" />
	<span aria-hidden="true">
		{#if typescript}{@render typescript()}{:else}TypeScript{/if}
	</span>
</div>

<style>
	.input-output-toggle {
		position: relative;
		display: flex;
		justify-content: center;
		gap: 0.5em;
		user-select: none;
		align-items: center;
		width: max-width;
		height: var(--ts-toggle-height);
		z-index: 2;
		padding: 0 var(--sk-page-padding-side);
		margin: 0 auto;
	}

	@media (min-width: 832px) {
		.input-output-toggle {
			padding: 0rem;
			transform: translateX(-1rem);
			width: var(--sidebar-menu-width);
			margin: 0 0 0 auto;
		}
	}
</style>
