<script>
	import { SvelteDate } from 'svelte/reactivity';

	let date = new SvelteDate();

	const pad = (n) => n < 10 ? '0' + n : n;

	$effect(() => {
		const interval = setInterval(() => {
			date.setTime(Date.now());
		}, 1000);

		return () => {
			clearInterval(interval);
		};
	});
</script>

<p>The time is {date.getHours()}:{pad(date.getMinutes())}:{pad(date.getSeconds())}</p>
