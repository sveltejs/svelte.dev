<script>
	import { clickOutside } from './click_outside.js';

	let showModal = $state(true);
</script>

<button onclick={() => (showModal = true)}>Show Modal</button>
{#if showModal}
	<div class="box" use:clickOutside onoutclick={() => (showModal = false)}>Click outside me!</div>
{/if}

<style>
	.box {
		--width: 100px;
		--height: 100px;
		position: absolute;
		width: var(--width);
		height: var(--height);
		left: calc(50% - var(--width) / 2);
		top: calc(50% - var(--height) / 2);
		display: flex;
		align-items: center;
		padding: 8px;
		border-radius: 4px;
		background-color: #ff3e00;
		color: #fff;
		text-align: center;
		font-weight: bold;
	}
</style>
