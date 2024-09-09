---
title: svelte/store
---



```js
// @noErrors
import {
	derived,
	fromStore,
	get,
	readable,
	readonly,
	toStore,
	writable
} from 'svelte/store';
```

## derived

Derived value store by synchronizing one or more readable stores and
applying an aggregation function over its input values.

https://svelte.dev/docs/svelte-store#derived

<div class="ts-block">

```ts
// @noErrors
function derived<S extends Stores, T>(
	stores: S,
	fn: (
		values: StoresValues<S>,
		set: (value: T) => void,
		update: (fn: Updater<T>) => void
	) => Unsubscriber | void,
	initial_value?: T | undefined
): Readable<T>;
```

</div>

## derived

Derived value store by synchronizing one or more readable stores and
applying an aggregation function over its input values.

https://svelte.dev/docs/svelte-store#derived

<div class="ts-block">

```ts
// @noErrors
function derived<S extends Stores, T>(
	stores: S,
	fn: (values: StoresValues<S>) => T,
	initial_value?: T | undefined
): Readable<T>;
```

</div>

## fromStore



<div class="ts-block">

```ts
// @noErrors
function fromStore<V>(store: Writable<V>): {
	current: V;
};
```

</div>

## fromStore



<div class="ts-block">

```ts
// @noErrors
function fromStore<V>(store: Readable<V>): {
	readonly current: V;
};
```

</div>

## get

Get the current value from a store by subscribing and immediately unsubscribing.

https://svelte.dev/docs/svelte-store#get

<div class="ts-block">

```ts
// @noErrors
function get<T>(store: Readable<T>): T;
```

</div>

## readable

Creates a `Readable` store that allows reading by subscription.

https://svelte.dev/docs/svelte-store#readable

<div class="ts-block">

```ts
// @noErrors
function readable<T>(
	value?: T | undefined,
	start?: StartStopNotifier<T> | undefined
): Readable<T>;
```

</div>

## readonly

Takes a store and returns a new one derived from the old one that is readable.

https://svelte.dev/docs/svelte-store#readonly

<div class="ts-block">

```ts
// @noErrors
function readonly<T>(store: Readable<T>): Readable<T>;
```

</div>

## toStore



<div class="ts-block">

```ts
// @noErrors
function toStore<V>(
	get: () => V,
	set: (v: V) => void
): Writable<V>;
```

</div>

## toStore



<div class="ts-block">

```ts
// @noErrors
function toStore<V>(get: () => V): Readable<V>;
```

</div>

## writable

Create a `Writable` store that allows both updating and reading by subscription.

https://svelte.dev/docs/svelte-store#writable

<div class="ts-block">

```ts
// @noErrors
function writable<T>(
	value?: T | undefined,
	start?: StartStopNotifier<T> | undefined
): Writable<T>;
```

</div>


