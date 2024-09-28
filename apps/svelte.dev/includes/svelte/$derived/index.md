```js
// @noErrors
import {
	apply,
	arguments,
	bind,
	by,
	call,
	caller,
	length,
	name,
	prototype,
	toString
} from '$derived';
```

## apply

<div class="ts-block">

```ts
// @noErrors
const apply: never;
```

</div>

## arguments

<div class="ts-block">

```ts
// @noErrors
const arguments: never;
```

</div>

## bind

<div class="ts-block">

```ts
// @noErrors
const bind: never;
```

</div>

## by

Sometimes you need to create complex derivations that don't fit inside a short expression.
In these cases, you can use `$derived.by` which accepts a function as its argument.

Example:

```ts
let total = $derived.by(() => {
	let result = 0;
	for (const n of numbers) {
		result += n;
	}
	return result;
});
```

https://svelte-5-preview.vercel.app/docs/runes#$derived-by

<div class="ts-block">

```ts
// @noErrors
function by<T>(fn: () => T): T;
```

</div>

## call

<div class="ts-block">

```ts
// @noErrors
const call: never;
```

</div>

## caller

<div class="ts-block">

```ts
// @noErrors
const caller: never;
```

</div>

## length

<div class="ts-block">

```ts
// @noErrors
const length: never;
```

</div>

## name

<div class="ts-block">

```ts
// @noErrors
const name: never;
```

</div>

## prototype

<div class="ts-block">

```ts
// @noErrors
const prototype: never;
```

</div>

## toString

<div class="ts-block">

```ts
// @noErrors
const toString: never;
```

</div>
