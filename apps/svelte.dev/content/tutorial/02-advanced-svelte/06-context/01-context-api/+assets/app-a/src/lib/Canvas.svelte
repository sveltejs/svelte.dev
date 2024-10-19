<script>
	import { SvelteSet } from 'svelte/reactivity';

	let { width = 100, height = 100, children } = $props();

	let canvas;
	let items = new SvelteSet();

	function addItem(fn) {
		$effect(() => {
			items.add(fn);
			return () => items.delete(fn);
		});
	}

	$effect(() => {
		const ctx = canvas.getContext('2d');

		ctx.clearRect(0, 0, width, height);
		items.forEach(fn => fn(ctx));
	});
</script>

<canvas bind:this={canvas} {width} {height}>
	{@render children()}
</canvas>

<style>
	canvas {
		width: 100%;
		height: 100%;
	}
</style>
