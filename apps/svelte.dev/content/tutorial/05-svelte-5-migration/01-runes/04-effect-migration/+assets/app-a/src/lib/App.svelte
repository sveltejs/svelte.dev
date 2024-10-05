<script>
	let count = 0;
	$: {
		if (count > 5) {
			alert('Count is too high!');
		}
	}
</script>

<button on:click={() => count++}>{count}</button>
