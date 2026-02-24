---
title: Attachment factories
---

Often, you need an attachment to depend on some parameters or component state. In this scenario, you can use an [attachment factory](/docs/svelte/@attach#Attachment-factories) — a function that _returns_ an attachment.

In this exercise, we want to add a tooltip to the `<button>` using the [`Tippy.js`](https://atomiks.github.io/tippyjs/) library. The attachment is already wired up with `{@attach tooltip}`, but if you hover over the button (or focus it with the keyboard) the tooltip contains no content.

First, we need to convert our simple attachment into a _factory_ function that returns an attachment.

```js
/// file: App.svelte
function tooltip(---node---) {
+++	return (node) => {+++
		const tooltip = tippy(node);
		return tooltip.destroy;
+++	};+++
}
```

Next, the factory needs to accept the options we want to pass to Tippy (in this case just `content`):

```js
/// file: App.svelte
function tooltip(+++content+++) {
	return (node) => {
		const tooltip = tippy(node+++, { content }+++);
		return tooltip.destroy;
	};
}
```

> [!NOTE] The `tooltip(content)` expression runs inside an effect, so the attachment is destroyed and recreated whenever content changes.

Finally, we need to call the attachment factory and pass the `content` argument in our `{@attach}` tag:

```svelte
/// file: App.svelte
<button {@attach tooltip+++(content)+++}>
	Hover me
</button>
```
