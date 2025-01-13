<script>
	let progress = $state(0);
</script>

<progress value={progress}></progress>

<button onclick={() => (progress = 0)}>
	0%
</button>

<button onclick={() => (progress = 0.25)}>
	25%
</button>

<button onclick={() => (progress = 0.5)}>
	50%
</button>

<button onclick={() => (progress = 0.75)}>
	75%
</button>

<button onclick={() => (progress = 1)}>
	100%
</button>

<style>
	progress {
		display: block;
		width: 100%;
	}
</style>
