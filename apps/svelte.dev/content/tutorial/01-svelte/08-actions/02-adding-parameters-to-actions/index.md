---
title: Adding parameters
---

Like transitions and animations, an action can take an argument, which the action function will be called with alongside the element it belongs to.

In this exercise, we want to add a tooltip to the `<button>` using the [`Tippy.js`](https://atomiks.github.io/tippyjs/) library. The action is already wired up with `use:tooltip`, but if you hover over the button (or focus it with the keyboard) the tooltip contains no content.

First, the action needs to accept a function that returns some options to pass to Tippy:

```js
/// file: App.svelte
function tooltip(node, +++fn+++) {
	$effect(() => {
		const tooltip = tippy(node, +++fn()+++);

		return tooltip.destroy;
	});
}
```

> [!NOTE] We're passing in a function, rather than the options themselves, because the `tooltip` function does not re-run when the options change.

Then, we need to pass the options into the action:

```svelte
/// file: App.svelte
<button use:tooltip+++={() => ({ content })}+++>
	Hover me
</button>
```

> [!NOTE] In Svelte 4, actions returned an object with `update` and `destroy` methods. This still works but we recommend using `$effect` instead, as it provides more flexibility and granularity.
