---
title: svelte/events
---



```js
// @noErrors
import { on } from 'svelte/events';
```

## on

Attaches an event handler to the window and returns a function that removes the handler. Using this
rather than `addEventListener` will preserve the correct order relative to handlers added declaratively
(with attributes like `onclick`), which use event delegation for performance reasons

<div class="ts-block">

```dts
function on<Type extends keyof WindowEventMap>(
	window: Window,
	type: Type,
	handler: (
		this: Window,
		event: WindowEventMap[Type]
	) => any,
	options?: AddEventListenerOptions | undefined
): () => void;
```

</div>

<div class="ts-block">

```dts
function on<Type extends keyof DocumentEventMap>(
	document: Document,
	type: Type,
	handler: (
		this: Document,
		event: DocumentEventMap[Type]
	) => any,
	options?: AddEventListenerOptions | undefined
): () => void;
```

</div>

<div class="ts-block">

```dts
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

<div class="ts-block">

```dts
function on<
	Element extends MediaQueryList,
	Type extends keyof MediaQueryListEventMap
>(
	element: Element,
	type: Type,
	handler: (
		this: Element,
		event: MediaQueryListEventMap[Type]
	) => any,
	options?: AddEventListenerOptions | undefined
): () => void;
```

</div>

<div class="ts-block">

```dts
function on(
	element: EventTarget,
	type: string,
	handler: EventListener,
	options?: AddEventListenerOptions | undefined
): () => void;
```

</div>




