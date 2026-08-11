<script>
	import { browser } from '$app/env';

	let count = $state(0);

	function increment() {
		count += 1;
	}
</script>

<h1>Rendered {browser ? 'in the browser' : 'on the server'}</h1>

<button onclick={increment}>
	Clicks: {count}
</button>
