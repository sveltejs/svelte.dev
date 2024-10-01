---
title: svelte/legacy
---



```js
// @noErrors
import {
	asClassComponent,
	createBubbler,
	createClassComponent,
	handlers,
	nonpassive,
	once,
	passive,
	preventDefault,
	run,
	self,
	stopImmediatePropagation,
	stopPropagation,
	trusted
} from 'svelte/legacy';
```

## asClassComponent

Takes the component function and returns a Svelte 4 compatible component constructor.

<div class="ts-block">

```dts
function asClassComponent<
	Props extends Record<string, any>,
	Exports extends Record<string, any>,
	Events extends Record<string, any>,
	Slots extends Record<string, any>
>(
	component:
		| SvelteComponent<Props, Events, Slots>
		| Component<Props>
): ComponentType<
	SvelteComponent<Props, Events, Slots> & Exports
>;
```

</div>

## createBubbler

Function to create a `bubble` function that mimic the behavior of `on:click` without handler available in svelte 4.

<div class="ts-block">

```dts
function createBubbler(): (
	type: string
) => (event: Event) => boolean;
```

</div>

## createClassComponent

Takes the same options as a Svelte 4 component and the component function and returns a Svelte 4 compatible component.

<div class="ts-block">

```dts
function createClassComponent<
	Props extends Record<string, any>,
	Exports extends Record<string, any>,
	Events extends Record<string, any>,
	Slots extends Record<string, any>
>(
	options: ComponentConstructorOptions<Props> & {
		component:
			| ComponentType<SvelteComponent<Props, Events, Slots>>
			| Component<Props>;
	}
): SvelteComponent<Props, Events, Slots> & Exports;
```

</div>

## handlers

Function to mimic the multiple listeners available in svelte 4

<div class="ts-block">

```dts
function handlers(
	...handlers: EventListener[]
): EventListener;
```

</div>

## nonpassive

Substitute for the `nonpassive` event modifier, implemented as an action

<div class="ts-block">

```dts
function nonpassive(
	node: HTMLElement,
	[event, handler]: [
		event: string,
		handler: () => EventListener
	]
): void;
```

</div>

## once

Substitute for the `once` event modifier

<div class="ts-block">

```dts
function once(
	fn: (event: Event, ...args: Array<unknown>) => void
): (event: Event, ...args: unknown[]) => void;
```

</div>

## passive

Substitute for the `passive` event modifier, implemented as an action

<div class="ts-block">

```dts
function passive(
	node: HTMLElement,
	[event, handler]: [
		event: string,
		handler: () => EventListener
	]
): void;
```

</div>

## preventDefault

Substitute for the `preventDefault` event modifier

<div class="ts-block">

```dts
function preventDefault(
	fn: (event: Event, ...args: Array<unknown>) => void
): (event: Event, ...args: unknown[]) => void;
```

</div>

## run

Runs the given function once immediately on the server, and works like `$effect.pre` on the client.

<div class="ts-block">

```dts
function run(fn: () => void | (() => void)): void;
```

</div>

## self

Substitute for the `self` event modifier

<div class="ts-block">

```dts
function self(
	fn: (event: Event, ...args: Array<unknown>) => void
): (event: Event, ...args: unknown[]) => void;
```

</div>

## stopImmediatePropagation

Substitute for the `stopImmediatePropagation` event modifier

<div class="ts-block">

```dts
function stopImmediatePropagation(
	fn: (event: Event, ...args: Array<unknown>) => void
): (event: Event, ...args: unknown[]) => void;
```

</div>

## stopPropagation

Substitute for the `stopPropagation` event modifier

<div class="ts-block">

```dts
function stopPropagation(
	fn: (event: Event, ...args: Array<unknown>) => void
): (event: Event, ...args: unknown[]) => void;
```

</div>

## trusted

Substitute for the `trusted` event modifier

<div class="ts-block">

```dts
function trusted(
	fn: (event: Event, ...args: Array<unknown>) => void
): (event: Event, ...args: unknown[]) => void;
```

</div>


