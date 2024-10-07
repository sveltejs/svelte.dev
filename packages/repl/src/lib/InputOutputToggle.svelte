<script lang="ts">
	import Checkbox from './Checkbox.svelte';

	let { checked = $bindable() }: { checked: boolean } = $props();
</script>

<!-- svelte-ignore a11y_label_has_associated_control -->
<label class="input-output-toggle">
	<span class:active={!checked} style="text-align: right">input</span>
	<span style="display:grid; place-items: center">
		<Checkbox bind:checked />
	</span>
	<span class:active={checked}>output</span>
</label>

<style>
	.input-output-toggle {
		position: relative;
		display: grid;
		user-select: none;
		flex: 0;
		grid-template-columns: 1fr 40px 1fr;
		grid-gap: 0.5em;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: var(--pane-controls-h);
		border-top: 1px solid var(--sk-back-5);
		font-family: var(--sk-font-ui);
		font-size: var(--sk-font-size-ui-small);
		z-index: 2;
	}

	span {
		color: var(--sk-text-4);
	}

	.active {
		color: var(--sk-text-2);
	}
</style>
