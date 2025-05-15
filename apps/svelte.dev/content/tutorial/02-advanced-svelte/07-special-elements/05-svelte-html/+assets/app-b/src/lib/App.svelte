<script>
	let darkmode = $state(false);
</script>

<svelte:html class={darkmode ? 'dark' : 'light'} />

<button onclick={() => darkmode = !darkmode}>toggle dark mode</button>
