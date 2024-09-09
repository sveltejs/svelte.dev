---
title: svelte/events
---



```js
// @noErrors
import { on } from 'svelte/events';
```

## on

Attaches an event handler to an element and returns a function that removes the handler. Using this
rather than `addEventListener` will preserve the correct order relative to handlers added declaratively
(with attributes like `onclick`), which use event delegation for performance reasons

<div class="ts-block">

```ts
// @noErrors
function on<
	Element extends HTMLElement,
	Type extends keyof HTMLElementEventMap
>(
	element: Element,
	type: Type,
	handler: (
		this: Element,
		event: HTMLElementEventMap[Type]
	) => any,
	options?: AddEventListenerOptions | undefined
): () => void;
```

</div>

## on

Attaches an event handler to an element and returns a function that removes the handler. Using this
rather than `addEventListener` will preserve the correct order relative to handlers added declaratively
(with attributes like `onclick`), which use event delegation for performance reasons

<div class="ts-block">

```ts
// @noErrors
function on(
	element: EventTarget,
	type: string,
	handler: EventListener,
	options?: AddEventListenerOptions | undefined
): () => void;
```

</div>


