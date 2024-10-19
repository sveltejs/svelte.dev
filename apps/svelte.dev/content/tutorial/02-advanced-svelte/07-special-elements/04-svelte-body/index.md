---
title: <svelte:body>
---

Similar to `<svelte:window>` and `<svelte:document>`, the `<svelte:body>` element allows you to listen for events that fire on `document.body`. This is useful with the `mouseenter` and `mouseleave` events, which don't fire on `window`.

Add `onmouseenter` and `onmouseleave` handlers to the `<svelte:body>` tag...

```svelte
/// file: App.svelte
<svelte:body
	+++onmouseenter={() => hereKitty = true}+++
	+++onmouseleave={() => hereKitty = false}+++
/>
```

...and hover over the `<body>`.
