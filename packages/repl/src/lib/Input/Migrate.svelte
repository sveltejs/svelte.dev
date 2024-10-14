<script lang="ts">
	import { get_repl_context } from '../context';

	const { migrate } = get_repl_context();
</script>

<button class="raised" on:click={migrate} title="Migrate this component towards the new syntax">
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
