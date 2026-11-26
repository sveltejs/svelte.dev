<script>
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

<button onclick={() => interval = Math.max(10, interval / 2)}>speed up</button>
<button onclick={() => interval = Math.min(2147483647, interval * 2)}>slow down</button>

<p>elapsed: {elapsed}</p>
