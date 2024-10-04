<script lang="ts">
	import { get_repl_context } from '../context';

	const { migrate } = get_repl_context();
</script>

<div class="container">
	<button on:click={migrate} title="Migrate this component towards the new syntax">migrate</button>
</div>

<style>
	/* TODO this is duplicated with RunesInfo.svelte */
	button {
		position: relative;
		display: flex;
		text-transform: uppercase;
		font-size: var(--sk-font-size-ui-small);
		padding: 0.8rem;
		gap: 0.5rem;
		margin-right: 0.3rem;
		z-index: 9999;
	}
</style>
