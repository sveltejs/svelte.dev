---
title: Binding to component instances
---

Just as you can bind to DOM elements, you can bind to component instances themselves with `bind:this`.

This is useful in the rare cases that you need to interact with a component programmatically (rather than by providing it with updated props). Revisiting our canvas app from [a few exercises ago](attach), it would be nice to add a button to clear the screen.

First, let's export a function from `Canvas.svelte`:

```svelte
/// file: Canvas.svelte
let canvas = $state();
let context = $state();
let coords = $state();

+++export function clear() {
	context.clearRect(0, 0, canvas.width, canvas.height);
}+++
```

Then, create a reference to the component instance:

```js
/// file: App.svelte
let selected = $state(colors[0]);
let size = $state(10);
let showMenu = $state(true);

+++let canvas;+++
```

```svelte
/// file: App.svelte
<Canvas +++bind:this={canvas}+++ color={selected} size={size} />
```

Finally, add a button that calls the `clear` function:

```svelte
/// file: App.svelte
<div class="controls">
	<button class="show-menu" onclick={() => showMenu = !showMenu}>
		{showMenu ? 'close' : 'menu'}
	</button>

+++	<button onclick={() => canvas.clear()}>
		clear
	</button>+++
</div>
```
