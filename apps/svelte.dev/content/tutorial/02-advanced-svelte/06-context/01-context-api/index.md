---
title: createContext
---

The context API provides a mechanism for components to 'talk' to each other without passing around data and functions as props, or dispatching lots of events. It's an advanced feature, but a useful one. In this exercise, we're going to recreate [Schotter](https://collections.vam.ac.uk/item/O221321/schotter-print-nees-georg/) by George Nees — one of the pioneers of generative art — using the context API.

Inside `Canvas.svelte`, there's an `addItem` function that adds an item to the canvas. We can make it available to components inside `<Canvas>`, like `<Square>`, with context.

First, in `context.js`, use `createContext` to create functions for getting and setting the context:

```js
/// file: context.js
import { createContext } from 'svelte';

+++export const [getCanvasContext, setCanvasContext] = createContext();+++
```

In `Canvas.svelte`, use `setCanvasContext` to make `addItem` available to child components:

```js
/// file: Canvas.svelte
+++import { setCanvasContext } from './context.js';+++
import { SvelteSet } from 'svelte/reactivity';

let { width = 100, height = 100, children } = $props();

let canvas;
let items = new SvelteSet();

+++setCanvasContext({ addItem });+++

function addItem(fn) {
	$effect(() => {
		items.add(fn);
		return () => items.delete(fn);
	});
}
```

In `Square.svelte`, use `getCanvasContext` to access it:

```js
/// file: Square.svelte
+++import { getCanvasContext } from './context.js';+++

let { x, y, size, rotate } = $props();

+++getCanvasContext().addItem(draw);+++
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

`setCanvasContext` and `getCanvasContext` must be called during component initialisation, so that the context can be correctly bound. Each call to `createContext` creates a separate context — by exporting the functions from `context.js`, both components use the same one.

> [!NOTE] Your context object can include anything, including reactive state. This allows you to pass values that change over time to child components:
>
> ```js
> // in context.js
> import { createContext } from 'svelte';
>
> export const [getCounterContext, setCounterContext] = createContext();
> ```
>
> ```js
> // in a parent component
> import { setCounterContext } from './context.js';
>
> let context = $state({...});
> setCounterContext(context);
> ```
>
> ```js
> // in a child component
> import { getCounterContext } from './context.js';
>
> const context = getCounterContext();
> ```
