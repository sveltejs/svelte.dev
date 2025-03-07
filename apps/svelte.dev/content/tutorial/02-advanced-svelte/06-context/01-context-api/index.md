---
title: setContext and getContext
---

The context API provides a mechanism for components to 'talk' to each other without passing around data and functions as props, or dispatching lots of events. It's an advanced feature, but a useful one. In this exercise, we're going to recreate [Schotter](https://collections.vam.ac.uk/item/O221321/schotter-print-nees-georg/) by George Nees — one of the pioneers of generative art — using the context API.

Inside `Canvas.svelte`, there's an `addItem` function that adds an item to the canvas. We can make it available to components inside `<Canvas>`, like `<Square>`, with `setContext`:

```js
/// file: Canvas.svelte
+++import { setContext } from 'svelte';+++
import { SvelteSet } from 'svelte/reactivity';

let { width = 100, height = 100, children } = $props();

let canvas;
let items = new SvelteSet();

+++setContext('canvas', { addItem });+++

function addItem(fn) {
	$effect(() => {
		items.add(fn);
		return () => items.delete(fn);
	});
}
```

Inside child components, we can now get the context with, well, `getContext`:

```js
/// file: Square.svelte
+++import { getContext } from 'svelte';+++

let { x, y, size, rotate } = $props();

+++getContext('canvas').addItem(draw);+++
```

So far, so... boring. Let's add some randomness to the grid:

```svelte
/// file: App.svelte
<div class="container">
	<Canvas width={800} height={1200}>
		{#each Array(12) as _, c}
			{#each Array(22) as _, r}
				<Square
					x={180 + c * 40+++ + jitter(r * 2)+++}
					y={180 + r * 40+++ + jitter(r * 2)+++}
					size={40}
					+++rotate={jitter(r * 0.05)}+++
				/>
			{/each}
		{/each}
	</Canvas>
</div>
```

`setContext` and `getContext` must be called during component initialisation, so that the context can be correctly bound. The key — `'canvas'` in this case — can be anything you like, including non-strings, which is useful for controlling who can access the context.

> [!NOTE] Your context object can include anything, including reactive state. This allows you to pass values that change over time to child components:
>
> ```js
> // in a parent component
> import { setContext } from 'svelte';
>
> let context = $state({...});
> setContext('my-context', context);
> ```
>
> ```js
> // in a child component
> import { getContext } from 'svelte';
>
> const context = getContext('my-context');
> ```
