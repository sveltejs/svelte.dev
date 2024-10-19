---
title: Dimensions
---

You can add `clientWidth`, `clientHeight`, `offsetWidth` and `offsetHeight` bindings to any element:

```svelte
/// file: App.svelte
<div +++bind:clientWidth={w} bind:clientHeight={h}+++>
	<span style="font-size: {size}px" contenteditable>{text}</span>
	<span class="size">{w} x {h}px</span>
</div>
```

These bindings are readonly — changing the values of `w` and `h` won't have any effect on the element.
