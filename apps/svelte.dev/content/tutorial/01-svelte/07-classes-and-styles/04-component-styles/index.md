---
title: Component styles
---

Often, you need to influence the styles inside a child component. Perhaps we want to make these boxes red, green and blue.

One way to do this is with the `:global` CSS modifier, which allows you to indiscriminately target elements inside other components:

```svelte
/// file: App.svelte
<style>
	.boxes :global(.box:nth-child(1)) {
		background-color: red;
	}

	.boxes :global(.box:nth-child(2)) {
		background-color: green;
	}

	.boxes :global(.box:nth-child(3)) {
		background-color: blue;
	}
</style>
```

But there are lots of reasons _not_ to do that. For one thing, it's extremely verbose. For another, it's brittle — any changes to the implementation details of `Box.svelte` could break the selector.

Most of all though, it's rude. Components should be able to decide for themselves which styles can be controlled from 'outside', in the same way they decide which variables are exposed as props. `:global` should be used as an escape hatch — a last resort.

Inside `Box.svelte`, change `background-color` so that it is determined by a [CSS custom property](https://developer.mozilla.org/en-US/docs/Web/CSS/--*):

```svelte
/// file: Box.svelte
<style>
	.box {
		width: 5em;
		height: 5em;
		border-radius: 0.5em;
		margin: 0 0 1em 0;
		background-color: +++var(--color, #ddd)+++;
	}
</style>
```

Any parent element (such as `<div class="boxes">`) can set the value of `--color`, but we can also set it on individual components:

```svelte
/// file: App.svelte
<div class="boxes">
	<Box +++--color="red"+++ />
	<Box +++--color="green"+++ />
	<Box +++--color="blue"+++ />
</div>
```

The values can be dynamic, like any other attribute.

> [!NOTE] This feature works by wrapping each component in an element with `display: contents`, where needed, and applying the custom properties to it. If you inspect the elements, you'll see markup like this:
>
> ```svelte
> <svelte-css-wrapper style="display: contents; --color: red;">
> 	<!-- contents -->
> </svelte-css-wrapper>
> ```
>
> Because of `display: contents` this won't affect your layout, but the extra element _can_ affect selectors like `.parent > .child`.
