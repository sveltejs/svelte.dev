---
title: Spreading events
---

We can also [spread](spread-props) event handlers directly onto elements. Here, we've defined an `onclick` handler in `App.svelte` — all we need to do is pass the props to the `<button>` in `BigRedButton.svelte`:

```svelte
/// file: BigRedButton.svelte
<button +++{...props}+++>
	Push
</button>
```
