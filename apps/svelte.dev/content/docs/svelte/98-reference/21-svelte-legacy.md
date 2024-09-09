---
title: svelte/legacy
---



```js
// @noErrors
import { asClassComponent, createClassComponent, run } from 'svelte/legacy';
```

## asClassComponent

Takes the component function and returns a Svelte 4 compatible component constructor.

<div class="ts-block">

```ts
// @noErrors
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

## createClassComponent

Takes the same options as a Svelte 4 component and the component function and returns a Svelte 4 compatible component.

<div class="ts-block">

```ts
// @noErrors
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

## run

Runs the given function once immediately on the server, and works like `$effect.pre` on the client.

<div class="ts-block">

```ts
// @noErrors
function run(fn: () => void | (() => void)): void;
```

</div>


