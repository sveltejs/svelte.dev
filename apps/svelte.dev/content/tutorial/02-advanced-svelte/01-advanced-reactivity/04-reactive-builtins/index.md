---
title: Reactive built-ins
---

Svelte ships with several reactive classes that you can use in place of JavaScript built-in objects — namely `Map`, `Set`, `Date`, `URL` and `URLSearchParams`.

In this exercise, we _could_ declare `date` using `$state(new Date())` and reassign it inside the `setInterval`. But a nicer alternative is to use `SvelteDate` from [`svelte/reactivity`](/docs/svelte/svelte-reactivity):

```svelte
/// file: App.svelte
<script>
	+++import { SvelteDate } from 'svelte/reactivity';+++

	let date = new +++SvelteDate();+++

	// ...
</script>
```
