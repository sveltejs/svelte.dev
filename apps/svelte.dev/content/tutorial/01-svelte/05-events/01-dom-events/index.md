---
title: DOM events
---

As we've briefly seen already, you can listen to any DOM event on an element (such as click or [pointermove](https://developer.mozilla.org/en-US/docs/Web/API/Element/pointermove_event)) with an `on<name>` function:

```svelte
/// file: App.svelte
<div +++onpointermove={onpointermove}+++>
	The pointer is at {Math.round(m.x)} x {Math.round(m.y)}
</div>
```

Like with any other property where the name matches the value, we can use the short form:

```svelte
/// file: App.svelte
<div +++{onpointermove}+++>
	The pointer is at {Math.round(m.x)} x {Math.round(m.y)}
</div>
```
