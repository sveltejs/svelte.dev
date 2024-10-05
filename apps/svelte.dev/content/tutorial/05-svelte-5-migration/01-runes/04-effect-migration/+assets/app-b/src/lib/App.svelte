<script>
	let count = $state(0);
	$effect(() => {
		if (count > 5) {
			alert('Count is too high!');
		}
	});
</script>

<button on:click={() => count++}>{count}</button>
