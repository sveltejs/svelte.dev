<script>
	let darkmode = $state(false);
</script>

<svelte:html />

<button onclick={() => darkmode = !darkmode}>toggle dark mode</button>
