---
title: Springs
---

The `Spring` class is an alternative to `Tween` that often works better for values that are frequently changing.

In this example we have a circle that follows the mouse, and two values — the circle's coordinates, and its size. Let's convert them to springs:

```svelte
/// file: App.svelte
<script>
	+++import { Spring } from 'svelte/motion+++';

	let coords = +++new Spring+++({ x: 50, y: 50 });
	let size = +++new Spring+++(10);
</script>
```

As with `Tween`, springs have a writable `target` property and a readonly `current` property. Update the event handlers...

```svelte
<svg
	onmousemove={(e) => {
		coords.+++target+++ = { x: e.clientX, y: e.clientY };
	}}
	onmousedown={() => (size.+++target+++ = 30)}
	onmouseup={() => (size.+++target+++ = 10)}
	role="presentation"
>
```

...and the `<circle>` attributes:

```svelte
<circle
	cx={coords.+++current+++.x}
	cy={coords.+++current+++.y}
	r={size.+++current+++}
></circle>
```

Both springs have default `stiffness` and `damping` values, which control the spring's, well... springiness. We can specify our own initial values:

```js
/// file: App.svelte
let coords = new Spring({ x: 50, y: 50 }, +++{
	stiffness: 0.1,
	damping: 0.25
}+++);
```

Waggle your mouse around, and try dragging the sliders to get a feel for how they affect the spring's behaviour. Notice that you can adjust the values while the spring is still in motion.
