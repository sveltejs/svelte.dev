---
title: Reactive classes
---

It's not just variables that can be made reactive — in Svelte, we can also make properties of classes reactive.

Let's make the `width` and `height` properties of our `Box` class reactive:

```js
/// file: App.svelte
class Box {
	width = +++$state(0);+++
	height = +++$state(0);+++
	area = 0;

	// ...
}
```

Now, when we interact with the range inputs or click the 'embiggen' button, the box reacts.

We can also use `$derived`, so that `box.area` updates reactively:

```js
/// file: App.svelte
class Box {
	width = $state(0);
	height = $state(0);
	area = +++$derived(this.width * this.height);+++

	// ...
}
```

> [!NOTE] In addition to `$state` and `$derived`, you can use `$state.raw` and `$derived.by` to define reactive fields.
