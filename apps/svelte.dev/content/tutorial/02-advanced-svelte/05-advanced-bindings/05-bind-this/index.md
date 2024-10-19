---
title: This
---

You can use the special `bind:this` directive to get a readonly binding to an element in your component.

The `$effect` in this exercise attempts to create a canvas context, but `canvas` is `undefined`. Begin by declaring it at the top level of the component...

```svelte
/// file: App.svelte
<script>
	import { paint } from './gradient.js';

	+++let canvas;+++

	$effect(() => {
		// ...
	});
</script>
```

...then add the directive to the `<canvas>` element:

```svelte
/// file: App.svelte
<canvas +++bind:this={canvas}+++ width={32} height={32}></canvas>
```

Note that the value of `canvas` will remain `undefined` until the component has mounted — in other words you can't access it until the `$effect` runs.
