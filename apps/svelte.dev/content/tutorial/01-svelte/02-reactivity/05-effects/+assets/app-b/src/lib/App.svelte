<script>
	let elapsed = $state(0);
	let interval = $state(1000);
	const MAX_INTERVAL = 2 ** 31 - 1;

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
<button onclick={() => interval = Math.min(interval * 2, MAX_INTERVAL)}>slow down</button>

<p>elapsed: {elapsed}</p>
