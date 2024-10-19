---
title: <svelte:document>
---

The `<svelte:document>` element allows you to listen for events that fire on `document`. This is useful with events like `selectionchange`, which doesn't fire on `window`.

Add the `onselectionchange` handler to the `<svelte:document>` tag:

```svelte
/// file: App.svelte
<svelte:document +++{onselectionchange}+++ />
```

> [!NOTE] Avoid `mouseenter` and `mouseleave` handlers on this element, as these events are not fired on `document` in all browsers. Use `<svelte:body>` instead.
