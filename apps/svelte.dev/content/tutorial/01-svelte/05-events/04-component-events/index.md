---
title: Component events
---

You can pass event handlers to components like any other prop. In `Stepper.svelte`, add `increment` and `decrement` props...

```svelte
/// file: Stepper.svelte
<script>
	let +++{ increment, decrement }+++ = $props();
</script>
```

...and wire them up:

```svelte
/// file: Stepper.svelte
<button +++onclick={decrement}+++>-1</button>
<button +++onclick={increment}+++>+1</button>
```

In `App.svelte`, define the handlers:

```svelte
/// file: App.svelte
<Stepper
	+++increment={() => value += 1}+++
	+++decrement={() => value -= 1}+++
/>
```
