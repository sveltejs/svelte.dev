---
title: Dimensions
---

You can add `clientWidth`, `clientHeight`, `offsetWidth` and `offsetHeight` bindings to any element, and Svelte will update the bound values using a [`ResizeObserver`](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver):

```svelte
/// file: App.svelte
<div +++bind:clientWidth={w} bind:clientHeight={h}+++>
	<span style="font-size: {size}px" contenteditable>edit this text</span>
	<span class="size">{w} x {h}px</span>
</div>
```

These bindings are readonly — changing the values of `w` and `h` won't have any effect on the element.

> [!NOTE] `display: inline` elements do not have a width or height (except for elements with 'intrinsic' dimensions, like `<img>` and `<canvas>`), and cannot be observed with a `ResizeObserver`. You will need to change the `display` style of these elements to something else, such as `inline-block`.
