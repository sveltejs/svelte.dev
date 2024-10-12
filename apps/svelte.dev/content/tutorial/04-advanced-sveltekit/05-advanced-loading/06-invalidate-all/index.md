---
title: invalidateAll
path: /Europe/London
---

Finally, there's the nuclear option — `invalidateAll()`. This will indiscriminately re-run all `load` functions for the current page, regardless of what they depend on.

Update `src/routes/[...timezone]/+page.svelte` from the previous exercise:

```svelte
/// file: src/routes/[...timezone]/+page.svelte
<script>
	import { onMount } from 'svelte';
	import { +++invalidateAll+++ } from '$app/navigation';

	let { data } = $props();

	onMount(() => {
		const interval = setInterval(() => {
			+++invalidateAll();+++
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

> [!NOTE] `invalidate(() => true)` and `invalidateAll` are _not_ the same. `invalidateAll` also re-runs `load` functions without any `url` dependencies, which `invalidate(() => true)` does not.
