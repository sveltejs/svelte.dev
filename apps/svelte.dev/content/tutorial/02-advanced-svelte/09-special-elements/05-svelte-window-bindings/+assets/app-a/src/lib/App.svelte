<script>
	let y = 0;
</script>

<svelte:window />

<main>
	<span>depth: {y}px</span>
</main>

<style>
	main {
		height: 400vw;
		margin: -1rem;
		background: url('/tutorial/deepsea.webp');
		background-size: cover;
	}

	span {
		position: fixed;
		font-size: 2em;
		color: white;
		font-variant: tabular-nums;
	}
</style>