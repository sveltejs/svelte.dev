---
title: The class attribute
---

Like any other attribute, you can specify classes with a JavaScript attribute. Here, we could add a `flipped` class to the card:

```svelte
/// file: App.svelte
<button
	class="card {+++flipped ? 'flipped' : ''+++}"
	onclick={() => flipped = !flipped}
>
```

This works as expected — if you click on the card now, it'll flip.

We can make it nicer though. Adding or removing a class based on some condition is such a common pattern in UI development that Svelte allows you to pass an object or array that is converted to a string by [clsx](https://github.com/lukeed/clsx).

```svelte
/// file: App.svelte
<button
	+++class={["card", { flipped }]}+++
	onclick={() => flipped = !flipped}
>
```

This means 'always add the `card` class, and add the `flipped` class whenever `flipped` is truthy'.

For more examples of how to combine conditional classes, [consult the `class` documentation](/docs/svelte/class).
