---
title: Capturing
---

Normally, event handlers run during the [_bubbling_](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Event_bubbling) phase. Notice what happens if you type something into the `<input>` in this example — the inner handler runs first, as the event 'bubbles' from the target up to the document, followed by the outer handler.

Sometimes, you want handlers to run during the _capture_ phase instead. Add `capture` to the end of the event name:

```svelte
/// file: App.svelte
<div onkeydown+++capture+++={(e) => alert(`<div> ${e.key}`)} role="presentation">
	<input onkeydown+++capture+++={(e) => alert(`<input> ${e.key}`)} />
</div>
```

Now, the relative order is reversed. If both capturing and non-capturing handlers exist for a given event, the capturing handlers will run first.
