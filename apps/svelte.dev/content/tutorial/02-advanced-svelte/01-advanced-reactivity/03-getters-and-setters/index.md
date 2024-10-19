---
title: Getters and setters
---

Classes are particularly useful when you need to validate data. In the case of this `Box` class, it shouldn't be possible to keep embiggening past the maximum allowed by the sliders, but that's exactly what happens.

We can fix that by replacing `width` and `height` with _getters_ and _setters_, otherwise known as _accessors_. First, convert them to [private properties](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_properties):

```js
/// file: App.svelte
class Box {
	+++#width+++ = $state(0);
	+++#height+++ = $state(0);
	area = $derived(this.+++#width+++ * this.+++#height+++);

	constructor(width, height) {
		this.+++#width+++ = width;
		this.+++#height+++ = height;
	}

	// ...
}
```

Then, create some getters and setters:

```js
/// file: App.svelte
class Box {
	// ...

+++	get width() {
		return this.#width;
	}

	get height() {
		return this.#height;
	}

	set width(value) {
		this.#width = value;
	}

	set height(value) {
		this.#height = value;
	}+++

	embiggen(amount) {
		this.width += amount;
		this.height += amount;
	}
}
```

Finally, add the validation to the setters:

```js
/// file: App.svelte
set width(value) {
	this.#width = +++Math.max(0, Math.min(MAX_SIZE, value));+++
}

set height(value) {
	this.#height = +++Math.max(0, Math.min(MAX_SIZE, value));+++
}
```

It's now impossible to increase the box size past safe limits, whether through the `bind:value` on the range inputs, or the `embiggen` method, no matter how hard you press the button.
