<script>
	let y = 0;
</script>

<svelte:window bind:scrollY={y} />

<main>
	<span>depth: {y}px</span>
</main>

<style>
	main {
		height: 400vw;
		margin: -1rem;
		background: url('./deepsea.webp');
		background-size: cover;
		padding: 1em;
	}

	span {
		position: fixed;
		font-size: 2em;
		color: white;
		font-variant: tabular-nums;
	}
</style>
