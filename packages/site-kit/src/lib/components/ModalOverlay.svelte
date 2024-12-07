<script lang="ts">
	import { fade } from 'svelte/transition';

	let { onclose }: { onclose?: () => void } = $props();
</script>

<div
	transition:fade={{ duration: 100 }}
	class="modal-overlay"
	aria-hidden="true"
	onclick={onclose}
></div>

<style>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 99;
		opacity: 0.7;
		pointer-events: auto;
		width: 100%;
		height: 100%;
		height: 100dvh;
		background: var(--sk-bg-1);
	}
</style>
