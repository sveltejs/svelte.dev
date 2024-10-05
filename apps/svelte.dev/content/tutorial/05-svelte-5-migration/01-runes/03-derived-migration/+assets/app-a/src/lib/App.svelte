<script>
	let count = 0;
	$: double = count * 2;
</script>

<button on:click={() => count++}>{count} * 2 = {double}</button>
