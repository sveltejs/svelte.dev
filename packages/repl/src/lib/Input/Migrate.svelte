<script lang="ts">
	import { get_repl_context } from '../context';

	let { can_migrate }: { can_migrate: boolean } = $props();

	const { migrate } = get_repl_context();
</script>

<button
	class="raised tooltip-left"
	disabled={!can_migrate}
	onclick={migrate}
	aria-label="Convert syntax from Svelte 4 to 5 if possible"
>
	migrate
</button>

<style>
	button {
		position: relative;
		display: flex;
		align-items: center;
		text-transform: uppercase;
		font: var(--sk-font-ui-small);
		padding: 0 0.8rem;
		height: 3.2rem;
	}
</style>
