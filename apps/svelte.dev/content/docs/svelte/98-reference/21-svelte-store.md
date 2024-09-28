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

<div class="ts-block">

```ts
// @noErrors
function get<T>(store: Readable<T>): T;
```

</div>

## readable

Creates a `Readable` store that allows reading by subscription.

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

<div class="ts-block">

```ts
// @noErrors
function writable<T>(
	value?: T | undefined,
	start?: StartStopNotifier<T> | undefined
): Writable<T>;
```

</div>

## Readable

Readable interface for subscribing.

<div class="ts-block">

```dts
interface Readable<T> {/*…*/}
```

<div class="ts-block-property">

```dts
subscribe(this: void, run: Subscriber<T>, invalidate?: () => void): Unsubscriber;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- `run` subscription callback
- `invalidate` cleanup callback

</div>

Subscribe on value changes.

</div>
</div>
</div>

## StartStopNotifier

Start and stop notification callbacks.
This function is called when the first subscriber subscribes.

<div class="ts-block">

```dts
type StartStopNotifier<T> = (
	set: (value: T) => void,
	update: (fn: Updater<T>) => void
) => void | (() => void);
```


</div>

## Subscriber

Callback to inform of a value updates.

<div class="ts-block">

```dts
type Subscriber<T> = (value: T) => void;
```


</div>

## Unsubscriber

Unsubscribes from value updates.

<div class="ts-block">

```dts
type Unsubscriber = () => void;
```


</div>

## Updater

Callback to update a value.

<div class="ts-block">

```dts
type Updater<T> = (value: T) => T;
```


</div>

## Writable

Writable interface for both updating and subscribing.

<div class="ts-block">

```dts
interface Writable<T> extends Readable<T> {/*…*/}
```

<div class="ts-block-property">

```dts
set(this: void, value: T): void;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- `value` to set

</div>

Set value and inform subscribers.

</div>
</div>

<div class="ts-block-property">

```dts
update(this: void, updater: Updater<T>): void;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- `updater` callback

</div>

Update value using callback and inform subscribers.

</div>
</div>
</div>


