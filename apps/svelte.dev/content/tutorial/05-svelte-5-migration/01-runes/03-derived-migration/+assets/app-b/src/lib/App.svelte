<script>
	let count = $state(0);
	const double = $derived(count * 2);
</script>

<button on:click={() => count++}>{count} * 2 = {double}</button>
