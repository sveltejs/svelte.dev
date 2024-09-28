```js
// @noErrors
import {
	apply,
	arguments,
	bind,
	call,
	caller,
	length,
	name,
	pre,
	prototype,
	root,
	toString,
	tracking
} from '$effect';
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

## pre

Runs code right before a component is mounted to the DOM, and then whenever its dependencies change, i.e. `$state` or `$derived` values.
The timing of the execution is right before the DOM is updated.

Example:

```ts
$effect.pre(() => console.log('The count is now ' + count));
```

If you return a function from the effect, it will be called right before the effect is run again, or when the component is unmounted.

Does not run during server side rendering.

https://svelte-5-preview.vercel.app/docs/runes#$effect-pre

<div class="ts-block">

```ts
// @noErrors
function pre(fn: () => void | (() => void)): void;
```

</div>

## prototype

<div class="ts-block">

```ts
// @noErrors
const prototype: never;
```

</div>

## root

The `$effect.root` rune is an advanced feature that creates a non-tracked scope that doesn't auto-cleanup. This is useful for
nested effects that you want to manually control. This rune also allows for creation of effects outside of the component
initialisation phase.

Example:

```svelte
<script>
	let count = $state(0);

	const cleanup = $effect.root(() => {
		$effect(() => {
			console.log(count);
		})

		 return () => {
			 console.log('effect root cleanup');
			}
	});
</script>

<button onclick={() => cleanup()}>cleanup</button>
```

https://svelte-5-preview.vercel.app/docs/runes#$effect-root

<div class="ts-block">

```ts
// @noErrors
function root(fn: () => void | (() => void)): () => void;
```

</div>

## toString

<div class="ts-block">

```ts
// @noErrors
const toString: never;
```

</div>

## tracking

The `$effect.tracking` rune is an advanced feature that tells you whether or not the code is running inside a tracking context, such as an effect or inside your template.

Example:

```svelte
<script>
	console.log('in component setup:', $effect.tracking()); // false

	$effect(() => {
		console.log('in effect:', $effect.tracking()); // true
	});
</script>

<p>in template: {$effect.tracking()}</p> <!-- true -->
```

This allows you to (for example) add things like subscriptions without causing memory leaks, by putting them in child effects.

https://svelte-5-preview.vercel.app/docs/runes#$effect-tracking

<div class="ts-block">

```ts
// @noErrors
function tracking(): boolean;
```

</div>
