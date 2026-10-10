<script>
	const OVERFLOW_LIMIT = 2 ** 31 - 1;
	let elapsed = $state(0);
	let interval = $state(1000);

	$effect(() => {
		const id = setInterval(() => {
			elapsed += 1;
		}, interval);

		return () => {
			clearInterval(id);
		};
	});
</script>

<button onclick={() => interval /= 2}>speed up</button>
<button onclick={() => interval = Math.min(interval * 2, OVERFLOW_LIMIT)}>slow down</button>

<p>elapsed: {elapsed}</p>
