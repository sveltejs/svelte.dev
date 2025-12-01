---
title: The attach tag
---

Attachments are essentially element-level lifecycle functions. They're useful for things like:

- interfacing with third-party libraries
- lazy-loaded images
- tooltips
- adding custom event handlers

In this app, you can scribble on the `<canvas>`, and change colours and brush size via the menu. But if you open the menu and cycle through the options with the Tab key, you'll soon find that the focus isn't _trapped_ inside the modal.

We can fix that with an attachment. Import `trapFocus` from `attachments.svelte.js`...

```svelte
/// file: App.svelte
<script>
	import Canvas from './Canvas.svelte';
	+++import { trapFocus } from './attachments.svelte.js';+++

	const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet', 'white', 'black'];

	let selected = $state(colors[0]);
	let size = $state(10);
	let showMenu = $state(true);
</script>
```

...then add it to the menu with the `{@attach}` tag:

```svelte
/// file: App.svelte
<div class="menu" +++{@attach trapFocus}+++>
```

Let's take a look at the `trapFocus` function in `attachments.svelte.js`. An attachment function is called with a `node` — the `<div class="menu">` in our case — when the node is mounted to the DOM. Attachments run inside an [effect](effects), so they re-run whenever any state read inside the function changes.

First, we need to add an event listener that intercepts Tab key presses:

```js
/// file: attachments.svelte.js
focusable()[0]?.focus();
+++const off = on(node, 'keydown', handleKeydown);+++
```

> [!NOTE] [`on`](/docs/svelte/svelte-events#on) is a wrapper around `addEventListener` that uses <a href="/docs/svelte/basic-markup#Events-Event-delegation">event delegation</a>. It returns a function that removes the handler.

Second, we need to do some cleanup when the node is unmounted — removing the event listener, and restoring focus to where it was before the element mounted. As with effects, an attachment can return a teardown function, which runs immediately before the attachment re-runs or after the element is removed from the DOM:

```js
/// file: attachments.svelte.js
focusable()[0]?.focus();
const off = on(node, 'keydown', handleKeydown);

+++return () => {
	off();
	previous?.focus();
};+++
```

Now, when you open the menu, you can cycle through the options with the Tab key.
