---
title: refreshAll
path: /Europe/London
---

Finally, there's the nuclear option — `refreshAll()`. This will indiscriminately re-run all `load` functions for the current page, regardless of what they depend on, and all currently active remote functions. Unlike reloading the page, it does not reset `page.state`.

Update `src/routes/[...timezone]/+page.svelte` from the previous exercise:

```svelte
/// file: src/routes/[...timezone]/+page.svelte
<script>
	import { onMount } from 'svelte';
	import { +++refreshAll+++ } from '$app/navigation';

	let { data } = $props();

	onMount(() => {
		const interval = setInterval(() => {
			+++refreshAll();+++
		}, 1000);

		return () => {
			clearInterval(interval);
		};
	});
</script>
```

The `depends` call in `src/routes/+layout.js` is no longer necessary:

```js
/// file: src/routes/+layout.js
export async function load(---{ depends }---) {
	---depends('data:now');---

	return {
		now: Date.now()
	};
}
```

> [!NOTE] `invalidate(() => true)` and `refreshAll()` are _not_ the same. `invalidate(() => true)` only re-runs `load` functions that depend on a URL, whereas `refreshAll()` re-runs every `load` function for the current page and all currently active remote functions.
