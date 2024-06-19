---
title: Generated Reference
---

This file is generated. Do not edit. If you are doing a translation, remove the include comments in the other .md files instead and replace it with the translated output.

<!-- @include_start $derived -->


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

undefined

<div class="ts-block">

```ts
// @noErrors
const apply: never;
```

</div>

## arguments

undefined

<div class="ts-block">

```ts
// @noErrors
const arguments: never;
```

</div>

## bind

undefined

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

undefined

<div class="ts-block">

```ts
// @noErrors
const call: never;
```

</div>

## caller

undefined

<div class="ts-block">

```ts
// @noErrors
const caller: never;
```

</div>

## length

undefined

<div class="ts-block">

```ts
// @noErrors
const length: never;
```

</div>

## name

undefined

<div class="ts-block">

```ts
// @noErrors
const name: never;
```

</div>

## prototype

undefined

<div class="ts-block">

```ts
// @noErrors
const prototype: never;
```

</div>

## toString

undefined

<div class="ts-block">

```ts
// @noErrors
const toString: never;
```

</div>


<!-- @include_end $derived -->

<!-- @include_start $effect -->


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

undefined

<div class="ts-block">

```ts
// @noErrors
const apply: never;
```

</div>

## arguments

undefined

<div class="ts-block">

```ts
// @noErrors
const arguments: never;
```

</div>

## bind

undefined

<div class="ts-block">

```ts
// @noErrors
const bind: never;
```

</div>

## call

undefined

<div class="ts-block">

```ts
// @noErrors
const call: never;
```

</div>

## caller

undefined

<div class="ts-block">

```ts
// @noErrors
const caller: never;
```

</div>

## length

undefined

<div class="ts-block">

```ts
// @noErrors
const length: never;
```

</div>

## name

undefined

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

undefined

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

undefined

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


<!-- @include_end $effect -->

<!-- @include_start $state -->


```js
// @noErrors
import {
	apply,
	arguments,
	bind,
	call,
	caller,
	frozen,
	is,
	length,
	name,
	prototype,
	snapshot,
	toString
} from '$state';
```

## apply

undefined

<div class="ts-block">

```ts
// @noErrors
const apply: never;
```

</div>

## arguments

undefined

<div class="ts-block">

```ts
// @noErrors
const arguments: never;
```

</div>

## bind

undefined

<div class="ts-block">

```ts
// @noErrors
const bind: never;
```

</div>

## call

undefined

<div class="ts-block">

```ts
// @noErrors
const call: never;
```

</div>

## caller

undefined

<div class="ts-block">

```ts
// @noErrors
const caller: never;
```

</div>

## frozen

Declares reactive read-only state that is shallowly immutable.

Example:
```ts
<script>
  let items = $state.frozen([0]);

  const addItem = () => {
    items = [...items, items.length];
  };
</script>

<button on:click={addItem}>
  {items.join(', ')}
</button>
```

https://svelte-5-preview.vercel.app/docs/runes#$state-raw

<div class="ts-block">

```ts
// @noErrors
function frozen<T>(initial: T): Readonly<T>;
```

</div>

## frozen



<div class="ts-block">

```ts
// @noErrors
function frozen<T>(): Readonly<T> | undefined;
```

</div>

## is

Compare two values, one or both of which is a reactive `$state(...)` proxy.

Example:
```ts
<script>
 let foo = $state({});
 let bar = {};

 foo.bar = bar;

 console.log(foo.bar === bar); // false — `foo.bar` is a reactive proxy
  console.log($state.is(foo.bar, bar)); // true
</script>
```

https://svelte-5-preview.vercel.app/docs/runes#$state.is

<div class="ts-block">

```ts
// @noErrors
function is(a: any, b: any): boolean;
```

</div>

## length

undefined

<div class="ts-block">

```ts
// @noErrors
const length: never;
```

</div>

## name

undefined

<div class="ts-block">

```ts
// @noErrors
const name: never;
```

</div>

## prototype

undefined

<div class="ts-block">

```ts
// @noErrors
const prototype: never;
```

</div>

## snapshot

To take a static snapshot of a deeply reactive `$state` proxy, use `$state.snapshot`:

Example:
```ts
<script>
  let counter = $state({ count: 0 });

  function onclick() {
    // Will log `{ count: ... }` rather than `Proxy { ... }`
    console.log($state.snapshot(counter));
  };
</script>
```

https://svelte-5-preview.vercel.app/docs/runes#$state.snapshot

<div class="ts-block">

```ts
// @noErrors
function snapshot<T>(state: T): T;
```

</div>

## toString

undefined

<div class="ts-block">

```ts
// @noErrors
const toString: never;
```

</div>


<!-- @include_end $state -->

<!-- @include_start svelte -->


```js
// @noErrors
import {
	afterUpdate,
	beforeUpdate,
	createEventDispatcher,
	flushSync,
	getAllContexts,
	getContext,
	hasContext,
	hydrate,
	mount,
	onDestroy,
	onMount,
	setContext,
	tick,
	unmount,
	untrack
} from 'svelte';
```

## afterUpdate

Schedules a callback to run immediately after the component has been updated.

The first time the callback runs will be after the initial `onMount`.

In runes mode use `$effect` instead.

https://svelte.dev/docs/svelte#afterupdate

<div class="ts-block">

```ts
// @noErrors
function afterUpdate(fn: () => void): void;
```

</div>

## beforeUpdate

Schedules a callback to run immediately before the component is updated after any state change.

The first time the callback runs will be before the initial `onMount`.

In runes mode use `$effect.pre` instead.

https://svelte.dev/docs/svelte#beforeupdate

<div class="ts-block">

```ts
// @noErrors
function beforeUpdate(fn: () => void): void;
```

</div>

## createEventDispatcher

Creates an event dispatcher that can be used to dispatch [component events](https://svelte.dev/docs#template-syntax-component-directives-on-eventname).
Event dispatchers are functions that can take two arguments: `name` and `detail`.

Component events created with `createEventDispatcher` create a
[CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
property and can contain any type of data.

The event dispatcher can be typed to narrow the allowed event names and the type of the `detail` argument:
```ts
const dispatch = createEventDispatcher<{
 loaded: never; // does not take a detail argument
 change: string; // takes a detail argument of type string, which is required
 optional: number | null; // takes an optional detail argument of type number
}>();
```

https://svelte.dev/docs/svelte#createeventdispatcher

<div class="ts-block">

```ts
// @noErrors
function createEventDispatcher<
	EventMap extends Record<string, any> = any
>(): EventDispatcher<EventMap>;
```

</div>

## flushSync

Synchronously flushes any pending state changes and those that result from it.

<div class="ts-block">

```ts
// @noErrors
function flushSync(fn?: (() => void) | undefined): void;
```

</div>

## getAllContexts

Retrieves the whole context map that belongs to the closest parent component.
Must be called during component initialisation. Useful, for example, if you
programmatically create a component and want to pass the existing context to it.

https://svelte.dev/docs/svelte#getallcontexts

<div class="ts-block">

```ts
// @noErrors
function getAllContexts<
	T extends Map<any, any> = Map<any, any>
>(): T;
```

</div>

## getContext

Retrieves the context that belongs to the closest parent component with the specified `key`.
Must be called during component initialisation.

https://svelte.dev/docs/svelte#getcontext

<div class="ts-block">

```ts
// @noErrors
function getContext<T>(key: any): T;
```

</div>

## hasContext

Checks whether a given `key` has been set in the context of a parent component.
Must be called during component initialisation.

https://svelte.dev/docs/svelte#hascontext

<div class="ts-block">

```ts
// @noErrors
function hasContext(key: any): boolean;
```

</div>

## hydrate

Hydrates a component on the given target and returns the exports and potentially the props (if compiled with `accessors: true`) of the component

<div class="ts-block">

```ts
// @noErrors
function hydrate<
	Props extends Record<string, any>,
	Exports extends Record<string, any>
>(
	component:
		| ComponentType<SvelteComponent<Props, any, any>>
		| Component<Props, Exports, any>,
	options: {
		target: Document | Element | ShadowRoot;
		props?: Props | undefined;
		events?: Record<string, (e: any) => any> | undefined;
		context?: Map<any, any> | undefined;
		intro?: boolean | undefined;
		recover?: boolean | undefined;
	}
): Exports;
```

</div>

## mount

Mounts a component to the given target and returns the exports and potentially the props (if compiled with `accessors: true`) of the component

<div class="ts-block">

```ts
// @noErrors
function mount<
	Props extends Record<string, any>,
	Exports extends Record<string, any>
>(
	component:
		| ComponentType<SvelteComponent<Props, any, any>>
		| Component<Props, Exports, any>,
	options: {
		target: Document | Element | ShadowRoot;
		anchor?: Node | undefined;
		props?: Props | undefined;
		events?: Record<string, (e: any) => any> | undefined;
		context?: Map<any, any> | undefined;
		intro?: boolean | undefined;
	}
): Exports;
```

</div>

## onDestroy

Schedules a callback to run immediately before the component is unmounted.

Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
only one that runs inside a server-side component.

https://svelte.dev/docs/svelte#ondestroy

<div class="ts-block">

```ts
// @noErrors
function onDestroy(fn: () => any): void;
```

</div>

## onMount

The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
It must be called during the component's initialisation (but doesn't need to live *inside* the component;
it can be called from an external module).

If a function is returned _synchronously_ from `onMount`, it will be called when the component is unmounted.

`onMount` does not run inside a [server-side component](https://svelte.dev/docs#run-time-server-side-component-api).

https://svelte.dev/docs/svelte#onmount

<div class="ts-block">

```ts
// @noErrors
function onMount<T>(
	fn: () =>
		| NotFunction<T>
		| Promise<NotFunction<T>>
		| (() => any)
): void;
```

</div>

## setContext

Associates an arbitrary `context` object with the current component and the specified `key`
and returns that object. The context is then available to children of the component
(including slotted content) with `getContext`.

Like lifecycle functions, this must be called during component initialisation.

https://svelte.dev/docs/svelte#setcontext

<div class="ts-block">

```ts
// @noErrors
function setContext<T>(key: any, context: T): T;
```

</div>

## tick

Returns a promise that resolves once any pending state changes have been applied.

<div class="ts-block">

```ts
// @noErrors
function tick(): Promise<void>;
```

</div>

## unmount

Unmounts a component that was previously mounted using `mount` or `hydrate`.

<div class="ts-block">

```ts
// @noErrors
function unmount(component: Record<string, any>): void;
```

</div>

## untrack

Use `untrack` to prevent something from being treated as an `$effect`/`$derived` dependency.

https://svelte-5-preview.vercel.app/docs/functions#untrack

<div class="ts-block">

```ts
// @noErrors
function untrack<T>(fn: () => T): T;
```

</div>

## Component

Can be used to create strongly typed Svelte components.

#### Example:

You have component library on npm called `component-library`, from which
you export a component called `MyComponent`. For Svelte+TypeScript users,
you want to provide typings. Therefore you create a `index.d.ts`:
```ts
import type { Component } from 'svelte';
export declare const MyComponent: Component<{ foo: string }> {}
```
Typing this makes it possible for IDEs like VS Code with the Svelte extension
to provide intellisense and to use the component like this in a Svelte file
with TypeScript:
```svelte
<script lang="ts">
	import { MyComponent } from "component-library";
</script>
<MyComponent foo={'bar'} />
```

<div class="ts-block">

```dts
interface Component<
	Props extends Record<string, any> = {},
	Exports extends Record<string, any> = {},
	Bindings extends keyof Props | '' = string
> {/*…*/}
```

<div class="ts-block-property">

```dts
(
	internal: unknown,
	props: Props
): {
	/**
	 * @deprecated This method only exists when using one of the legacy compatibility helpers, which
	 * is a stop-gap solution. See https://svelte-5-preview.vercel.app/docs/breaking-changes#components-are-no-longer-classes
	 * for more info.
	 */
	$on?(type: string, callback: (e: any) => void): () => void;
	/**
	 * @deprecated This method only exists when using one of the legacy compatibility helpers, which
	 * is a stop-gap solution. See https://svelte-5-preview.vercel.app/docs/breaking-changes#components-are-no-longer-classes
	 * for more info.
	 */
	$set?(props: Partial<Props>): void;
} & Exports;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- `internal` An internal object used by Svelte. Do not use or modify.
- `props` The props passed to the component.

</div>

</div>
</div>

<div class="ts-block-property">

```dts
element?: typeof HTMLElement;
```

<div class="ts-block-property-details">

The custom element version of the component. Only present if compiled with the `customElement` compiler option

</div>
</div>
</div>

## ComponentConstructorOptions

<blockquote class="tag deprecated">

In Svelte 4, components are classes. In Svelte 5, they are functions.
Use `mount` instead to instantiate components.
See [breaking changes](https://svelte-5-preview.vercel.app/docs/breaking-changes#components-are-no-longer-classes)
for more info.

</blockquote>

<div class="ts-block">

```dts
interface ComponentConstructorOptions<
	Props extends Record<string, any> = Record<string, any>
> {/*…*/}
```

<div class="ts-block-property">

```dts
target: Element | Document | ShadowRoot;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
anchor?: Element;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
props?: Props;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
context?: Map<any, any>;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
hydrate?: boolean;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
intro?: boolean;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
$$inline?: boolean;
```

<div class="ts-block-property-details"></div>
</div>
</div>

## ComponentEvents

<blockquote class="tag deprecated">

The new `Component` type does not have a dedicated Events type. Use `ComponentProps` instead.

</blockquote>

<div class="ts-block">

```dts
type ComponentEvents<Comp extends SvelteComponent> =
	Comp extends SvelteComponent<any, infer Events>
		? Events
		: never;
```


</div>

## ComponentProps

Convenience type to get the props the given component expects. Example:
```html
<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import Component from './Component.svelte';

	const props: ComponentProps<Component> = { foo: 'bar' }; // Errors if these aren't the correct props
</script>
```

<div class="ts-block">

```dts
type ComponentProps<
	Comp extends SvelteComponent | Component<any>
> =
	Comp extends SvelteComponent<infer Props>
		? Props
		: Comp extends Component<infer Props>
			? Props
			: never;
```


</div>

## ComponentType

<blockquote class="tag deprecated">

This type is obsolete when working with the new `Component` type.

</blockquote>

<div class="ts-block">

```dts
type ComponentType<
	Comp extends SvelteComponent = SvelteComponent
> = (new (
	options: ComponentConstructorOptions<
		Comp extends SvelteComponent<infer Props>
			? Props
			: Record<string, any>
	>
) => Comp) & {
	/** The custom element version of the component. Only present if compiled with the `customElement` compiler option */
	element?: typeof HTMLElement;
};
```


</div>

## EventDispatcher

<div class="ts-block">

```dts
interface EventDispatcher<
	EventMap extends Record<string, any>
> {/*…*/}
```

<div class="ts-block-property">

```dts
<Type extends keyof EventMap>(
	...args: null extends EventMap[Type]
		? [type: Type, parameter?: EventMap[Type] | null | undefined, options?: DispatchOptions]
		: undefined extends EventMap[Type]
			? [type: Type, parameter?: EventMap[Type] | null | undefined, options?: DispatchOptions]
			: [type: Type, parameter: EventMap[Type], options?: DispatchOptions]
): boolean;
```

<div class="ts-block-property-details"></div>
</div>
</div>

## Snippet

The type of a `#snippet` block. You can use it to (for example) express that your component expects a snippet of a certain type:
```ts
let { banner }: { banner: Snippet<{ text: string }> } = $props();
```
You can only call a snippet through the `{@render ...}` tag.

<div class="ts-block">

```dts
type Snippet<T extends unknown[] = []> =
	// this conditional allows tuples but not arrays. Arrays would indicate a
	// rest parameter type, which is not supported. If rest parameters are added
	// in the future, the condition can be removed.
	number extends T['length']
		? never
		: {
				(
					this: void,
					...args: T
				): typeof SnippetReturn & {
					_: 'functions passed to {@render ...} tags must use the `Snippet` type imported from "svelte"';
				};
			};
```


</div>

## SvelteComponent

This was the base class for Svelte components in Svelte 4. Svelte 5+ components
are completely different under the hood. For typing, use `Component` instead.
To instantiate components, use `mount` instead`.
See [breaking changes documentation](https://svelte-5-preview.vercel.app/docs/breaking-changes#components-are-no-longer-classes) for more info.

<div class="ts-block">

```dts
class SvelteComponent<
	Props extends Record<string, any> = Record<string, any>,
	Events extends Record<string, any> = any,
	Slots extends Record<string, any> = any
> {/*…*/}
```

<div class="ts-block-property">

```dts
static element?: typeof HTMLElement;
```

<div class="ts-block-property-details">

The custom element version of the component. Only present if compiled with the `customElement` compiler option

</div>
</div>

<div class="ts-block-property">

```dts
[prop: string]: any;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
constructor(options: ComponentConstructorOptions<Properties<Props, Slots>>);
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag deprecated">deprecated</span> This constructor only exists when using the `asClassComponent` compatibility helper, which
is a stop-gap solution. Migrate towards using `mount` instead. See
https://svelte-5-preview.vercel.app/docs/breaking-changes#components-are-no-longer-classes for more info.

</div>

</div>
</div>

<div class="ts-block-property">

```dts
$destroy(): void;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag deprecated">deprecated</span> This method only exists when using one of the legacy compatibility helpers, which
is a stop-gap solution. See https://svelte-5-preview.vercel.app/docs/breaking-changes#components-are-no-longer-classes
for more info.

</div>

</div>
</div>

<div class="ts-block-property">

```dts
$on<K extends Extract<keyof Events, string>>(
	type: K,
	callback: (e: Events[K]) => void
): () => void;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag deprecated">deprecated</span> This method only exists when using one of the legacy compatibility helpers, which
is a stop-gap solution. See https://svelte-5-preview.vercel.app/docs/breaking-changes#components-are-no-longer-classes
for more info.

</div>

</div>
</div>

<div class="ts-block-property">

```dts
$set(props: Partial<Props>): void;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag deprecated">deprecated</span> This method only exists when using one of the legacy compatibility helpers, which
is a stop-gap solution. See https://svelte-5-preview.vercel.app/docs/breaking-changes#components-are-no-longer-classes
for more info.

</div>

</div>
</div>
</div>

## SvelteComponentTyped

<blockquote class="tag deprecated">

Use `Component` instead. See [breaking changes documentation](https://svelte-5-preview.vercel.app/docs/breaking-changes#components-are-no-longer-classes) for more information.

</blockquote>

<div class="ts-block">

```dts
class SvelteComponentTyped<
	Props extends Record<string, any> = Record<string, any>,
	Events extends Record<string, any> = any,
	Slots extends Record<string, any> = any
> extends SvelteComponent<Props, Events, Slots> {}
```


</div>


<!-- @include_end svelte -->

<!-- @include_start svelte/action -->
## Action

Actions are functions that are called when an element is created.
You can use this interface to type such actions.
The following example defines an action that only works on `<div>` elements
and optionally accepts a parameter which it has a default value for:
```ts
export const myAction: Action<HTMLDivElement, { someProperty: boolean } | undefined> = (node, param = { someProperty: true }) => {
  // ...
}
```
`Action<HTMLDivElement>` and `Action<HTMLDiveElement, undefined>` both signal that the action accepts no parameters.

You can return an object with methods `update` and `destroy` from the function and type which additional attributes and events it has.
See interface `ActionReturn` for more details.

Docs: https://svelte.dev/docs/svelte-action

<div class="ts-block">

```dts
interface Action<
	Element = HTMLElement,
	Parameter = undefined,
	Attributes extends Record<string, any> = Record<
		never,
		any
	>
> {/*…*/}
```

<div class="ts-block-property">

```dts
<Node extends Element>(
	...args: undefined extends Parameter
		? [node: Node, parameter?: Parameter]
		: [node: Node, parameter: Parameter]
): void | ActionReturn<Parameter, Attributes>;
```

<div class="ts-block-property-details"></div>
</div>
</div>

## ActionReturn

Actions can return an object containing the two properties defined in this interface. Both are optional.
- update: An action can have a parameter. This method will be called whenever that parameter changes,
  immediately after Svelte has applied updates to the markup. `ActionReturn` and `ActionReturn<undefined>` both
  mean that the action accepts no parameters.
- destroy: Method that is called after the element is unmounted

Additionally, you can specify which additional attributes and events the action enables on the applied element.
This applies to TypeScript typings only and has no effect at runtime.

Example usage:
```ts
interface Attributes {
	newprop?: string;
	'on:event': (e: CustomEvent<boolean>) => void;
}

export function myAction(node: HTMLElement, parameter: Parameter): ActionReturn<Parameter, Attributes> {
	// ...
	return {
		update: (updatedParameter) => {...},
		destroy: () => {...}
	};
}
```

Docs: https://svelte.dev/docs/svelte-action

<div class="ts-block">

```dts
interface ActionReturn<
	Parameter = undefined,
	Attributes extends Record<string, any> = Record<
		never,
		any
	>
> {/*…*/}
```

<div class="ts-block-property">

```dts
update?: (parameter: Parameter) => void;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
destroy?: () => void;
```

<div class="ts-block-property-details"></div>
</div>
</div>


<!-- @include_end svelte/action -->

<!-- @include_start svelte/animate -->


```js
// @noErrors
import { flip } from 'svelte/animate';
```

## flip

The flip function calculates the start and end position of an element and animates between them, translating the x and y values.
`flip` stands for [First, Last, Invert, Play](https://aerotwist.com/blog/flip-your-animations/).

https://svelte.dev/docs/svelte-animate#flip

<div class="ts-block">

```ts
// @noErrors
function flip(
	node: Element,
	{
		from,
		to
	}: {
		from: DOMRect;
		to: DOMRect;
	},
	params?: FlipParams
): AnimationConfig;
```

</div>

## AnimationConfig

<div class="ts-block">

```dts
interface AnimationConfig {/*…*/}
```

<div class="ts-block-property">

```dts
delay?: number;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
duration?: number;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
easing?: (t: number) => number;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
css?: (t: number, u: number) => string;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
tick?: (t: number, u: number) => void;
```

<div class="ts-block-property-details"></div>
</div>
</div>

## FlipParams

<div class="ts-block">

```dts
interface FlipParams {/*…*/}
```

<div class="ts-block-property">

```dts
delay?: number;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
duration?: number | ((len: number) => number);
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
easing?: (t: number) => number;
```

<div class="ts-block-property-details"></div>
</div>
</div>


<!-- @include_end svelte/animate -->

<!-- @include_start svelte/compiler -->


```js
// @noErrors
import {
	VERSION,
	compile,
	compileModule,
	migrate,
	parse,
	preprocess,
	walk
} from 'svelte/compiler';
```

## VERSION

The current version, as set in package.json.

https://svelte.dev/docs/svelte-compiler#svelte-version

<div class="ts-block">

```ts
// @noErrors
const VERSION: string;
```

</div>

## compile

`compile` converts your `.svelte` source code into a JavaScript module that exports a component

https://svelte.dev/docs/svelte-compiler#svelte-compile

<div class="ts-block">

```ts
// @noErrors
function compile(
	source: string,
	options: CompileOptions
): CompileResult;
```

</div>

## compileModule

`compileModule` takes your JavaScript source code containing runes, and turns it into a JavaScript module.

https://svelte.dev/docs/svelte-compiler#svelte-compile

<div class="ts-block">

```ts
// @noErrors
function compileModule(
	source: string,
	options: ModuleCompileOptions
): CompileResult;
```

</div>

## migrate

Does a best-effort migration of Svelte code towards using runes, event attributes and render tags.
May throw an error if the code is too complex to migrate automatically.

<div class="ts-block">

```ts
// @noErrors
function migrate(source: string): {
	code: string;
};
```

</div>

## parse

The parse function parses a component, returning only its abstract syntax tree.

The `modern` option (`false` by default in Svelte 5) makes the parser return a modern AST instead of the legacy AST.
`modern` will become `true` by default in Svelte 6, and the option will be removed in Svelte 7.

https://svelte.dev/docs/svelte-compiler#svelte-parse

<div class="ts-block">

```ts
// @noErrors
function parse(
	source: string,
	options: {
		filename?: string;
		modern: true;
	}
): Root;
```

</div>

## parse

The parse function parses a component, returning only its abstract syntax tree.

The `modern` option (`false` by default in Svelte 5) makes the parser return a modern AST instead of the legacy AST.
`modern` will become `true` by default in Svelte 6, and the option will be removed in Svelte 7.

https://svelte.dev/docs/svelte-compiler#svelte-parse

<div class="ts-block">

```ts
// @noErrors
function parse(
	source: string,
	options?:
		| {
				filename?: string | undefined;
				modern?: false | undefined;
		  }
		| undefined
): LegacyRoot;
```

</div>

## preprocess

The preprocess function provides convenient hooks for arbitrarily transforming component source code.
For example, it can be used to convert a <style lang="sass"> block into vanilla CSS.

https://svelte.dev/docs/svelte-compiler#svelte-preprocess

<div class="ts-block">

```ts
// @noErrors
function preprocess(
	source: string,
	preprocessor: PreprocessorGroup | PreprocessorGroup[],
	options?:
		| {
				filename?: string | undefined;
		  }
		| undefined
): Promise<Processed>;
```

</div>

## walk

undefined

<div class="ts-block">

```ts
// @noErrors
function walk(): never;
```

</div>

## CompileError

<div class="ts-block">

```dts
class CompileError extends Error {/*…*/}
```

<div class="ts-block-property">

```dts
constructor(code: string, message: string, position: [number, number] | undefined);
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
filename: string | undefined;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
position: CompileError_1['position'];
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
start: CompileError_1['start'];
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
end: CompileError_1['end'];
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
code: string;
```

<div class="ts-block-property-details"></div>
</div>
</div>


<!-- @include_end svelte/compiler -->

<!-- @include_start svelte/easing -->


```js
// @noErrors
import {
	backIn,
	backInOut,
	backOut,
	bounceIn,
	bounceInOut,
	bounceOut,
	circIn,
	circInOut,
	circOut,
	cubicIn,
	cubicInOut,
	cubicOut,
	elasticIn,
	elasticInOut,
	elasticOut,
	expoIn,
	expoInOut,
	expoOut,
	linear,
	quadIn,
	quadInOut,
	quadOut,
	quartIn,
	quartInOut,
	quartOut,
	quintIn,
	quintInOut,
	quintOut,
	sineIn,
	sineInOut,
	sineOut
} from 'svelte/easing';
```

## backIn

https://svelte.dev/docs/svelte-easing

<div class="ts-block">

```ts
// @noErrors
function backIn(t: number): number;
```

</div>

## backInOut

https://svelte.dev/docs/svelte-easing

<div class="ts-block">

```ts
// @noErrors
function backInOut(t: number): number;
```

</div>

## backOut

https://svelte.dev/docs/svelte-easing

<div class="ts-block">

```ts
// @noErrors
function backOut(t: number): number;
```

</div>

## bounceIn

https://svelte.dev/docs/svelte-easing

<div class="ts-block">

```ts
// @noErrors
function bounceIn(t: number): number;
```

</div>

## bounceInOut

https://svelte.dev/docs/svelte-easing

<div class="ts-block">

```ts
// @noErrors
function bounceInOut(t: number): number;
```

</div>

## bounceOut

https://svelte.dev/docs/svelte-easing

<div class="ts-block">

```ts
// @noErrors
function bounceOut(t: number): number;
```

</div>

## circIn

https://svelte.dev/docs/svelte-easing

<div class="ts-block">

```ts
// @noErrors
function circIn(t: number): number;
```

</div>

## circInOut

https://svelte.dev/docs/svelte-easing

<div class="ts-block">

```ts
// @noErrors
function circInOut(t: number): number;
```

</div>

## circOut

https://svelte.dev/docs/svelte-easing

<div class="ts-block">

```ts
// @noErrors
function circOut(t: number): number;
```

</div>

## cubicIn

https://svelte.dev/docs/svelte-easing

<div class="ts-block">

```ts
// @noErrors
function cubicIn(t: number): number;
```

</div>

## cubicInOut

https://svelte.dev/docs/svelte-easing

<div class="ts-block">

```ts
// @noErrors
function cubicInOut(t: number): number;
```

</div>

## cubicOut

https://svelte.dev/docs/svelte-easing

<div class="ts-block">

```ts
// @noErrors
function cubicOut(t: number): number;
```

</div>

## elasticIn

https://svelte.dev/docs/svelte-easing

<div class="ts-block">

```ts
// @noErrors
function elasticIn(t: number): number;
```

</div>

## elasticInOut

https://svelte.dev/docs/svelte-easing

<div class="ts-block">

```ts
// @noErrors
function elasticInOut(t: number): number;
```

</div>

## elasticOut

https://svelte.dev/docs/svelte-easing

<div class="ts-block">

```ts
// @noErrors
function elasticOut(t: number): number;
```

</div>

## expoIn

https://svelte.dev/docs/svelte-easing

<div class="ts-block">

```ts
// @noErrors
function expoIn(t: number): number;
```

</div>

## expoInOut

https://svelte.dev/docs/svelte-easing

<div class="ts-block">

```ts
// @noErrors
function expoInOut(t: number): number;
```

</div>

## expoOut

https://svelte.dev/docs/svelte-easing

<div class="ts-block">

```ts
// @noErrors
function expoOut(t: number): number;
```

</div>

## linear

https://svelte.dev/docs/svelte-easing

<div class="ts-block">

```ts
// @noErrors
function linear(t: number): number;
```

</div>

## quadIn

https://svelte.dev/docs/svelte-easing

<div class="ts-block">

```ts
// @noErrors
function quadIn(t: number): number;
```

</div>

## quadInOut

https://svelte.dev/docs/svelte-easing

<div class="ts-block">

```ts
// @noErrors
function quadInOut(t: number): number;
```

</div>

## quadOut

https://svelte.dev/docs/svelte-easing

<div class="ts-block">

```ts
// @noErrors
function quadOut(t: number): number;
```

</div>

## quartIn

https://svelte.dev/docs/svelte-easing

<div class="ts-block">

```ts
// @noErrors
function quartIn(t: number): number;
```

</div>

## quartInOut

https://svelte.dev/docs/svelte-easing

<div class="ts-block">

```ts
// @noErrors
function quartInOut(t: number): number;
```

</div>

## quartOut

https://svelte.dev/docs/svelte-easing

<div class="ts-block">

```ts
// @noErrors
function quartOut(t: number): number;
```

</div>

## quintIn

https://svelte.dev/docs/svelte-easing

<div class="ts-block">

```ts
// @noErrors
function quintIn(t: number): number;
```

</div>

## quintInOut

https://svelte.dev/docs/svelte-easing

<div class="ts-block">

```ts
// @noErrors
function quintInOut(t: number): number;
```

</div>

## quintOut

https://svelte.dev/docs/svelte-easing

<div class="ts-block">

```ts
// @noErrors
function quintOut(t: number): number;
```

</div>

## sineIn

https://svelte.dev/docs/svelte-easing

<div class="ts-block">

```ts
// @noErrors
function sineIn(t: number): number;
```

</div>

## sineInOut

https://svelte.dev/docs/svelte-easing

<div class="ts-block">

```ts
// @noErrors
function sineInOut(t: number): number;
```

</div>

## sineOut

https://svelte.dev/docs/svelte-easing

<div class="ts-block">

```ts
// @noErrors
function sineOut(t: number): number;
```

</div>


<!-- @include_end svelte/easing -->

<!-- @include_start svelte/events -->


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


<!-- @include_end svelte/events -->

<!-- @include_start svelte/legacy -->


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
		| import('svelte').SvelteComponent<Props, Events, Slots>
		| import('svelte').Component<Props, any, string>
): import('svelte').ComponentType<
	import('svelte').SvelteComponent<Props, Events, Slots> &
		Exports
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
	options: import('svelte').ComponentConstructorOptions<Props> & {
		component:
			| import('svelte').ComponentType<
					import('svelte').SvelteComponent<
						Props,
						Events,
						Slots
					>
			  >
			| import('svelte').Component<Props, any, string>;
		immutable?: boolean | undefined;
		hydrate?: boolean | undefined;
		recover?: boolean | undefined;
	}
): import('svelte').SvelteComponent<Props, Events, Slots> &
	Exports;
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


<!-- @include_end svelte/legacy -->

<!-- @include_start svelte/motion -->


```js
// @noErrors
import { spring, tweened } from 'svelte/motion';
```

## spring

The spring function in Svelte creates a store whose value is animated, with a motion that simulates the behavior of a spring. This means when the value changes, instead of transitioning at a steady rate, it "bounces" like a spring would, depending on the physics parameters provided. This adds a level of realism to the transitions and can enhance the user experience.

https://svelte.dev/docs/svelte-motion#spring

<div class="ts-block">

```ts
// @noErrors
function spring<T = any>(
	value?: T | undefined,
	opts?: SpringOpts | undefined
): Spring<T>;
```

</div>

## tweened

A tweened store in Svelte is a special type of store that provides smooth transitions between state values over time.

https://svelte.dev/docs/svelte-motion#tweened

<div class="ts-block">

```ts
// @noErrors
function tweened<T>(
	value?: T | undefined,
	defaults?: TweenedOptions<T> | undefined
): Tweened<T>;
```

</div>

## Spring

<div class="ts-block">

```dts
interface Spring<T> extends Readable<T> {/*…*/}
```

<div class="ts-block-property">

```dts
set: (new_value: T, opts?: SpringUpdateOpts) => Promise<void>;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
update: (fn: Updater<T>, opts?: SpringUpdateOpts) => Promise<void>;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
precision: number;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
damping: number;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
stiffness: number;
```

<div class="ts-block-property-details"></div>
</div>
</div>

## Tweened

<div class="ts-block">

```dts
interface Tweened<T> extends Readable<T> {/*…*/}
```

<div class="ts-block-property">

```dts
set(value: T, opts?: TweenedOptions<T>): Promise<void>;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
update(updater: Updater<T>, opts?: TweenedOptions<T>): Promise<void>;
```

<div class="ts-block-property-details"></div>
</div>
</div>


<!-- @include_end svelte/motion -->

<!-- @include_start svelte/reactivity -->

<!-- @include_end svelte/reactivity -->

<!-- @include_start svelte/server -->


```js
// @noErrors
import { render } from 'svelte/server';
```

## render

Only available on the server and when compiling with the `server` option.
Takes a component and returns an object with `body` and `head` properties on it, which you can use to populate the HTML when server-rendering your app.

<div class="ts-block">

```ts
// @noErrors
function render<Props extends Record<string, any>>(
	component:
		| import('svelte').Component<Props, any, string>
		| import('svelte').ComponentType<
				import('svelte').SvelteComponent<Props, any, any>
		  >,
	options: {
		props: Omit<Props, '$$slots' | '$$events'>;
		context?: Map<any, any> | undefined;
	}
): RenderOutput;
```

</div>


<!-- @include_end svelte/server -->

<!-- @include_start svelte/store -->


```js
// @noErrors
import {
	derived,
	get,
	readable,
	readonly,
	safe_not_equal,
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

## safe_not_equal



<div class="ts-block">

```ts
// @noErrors
function safe_not_equal(a: any, b: any): boolean;
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

## Readable

Readable interface for subscribing.

<div class="ts-block">

```dts
interface Readable<T> {/*…*/}
```

<div class="ts-block-property">

```dts
subscribe(this: void, run: Subscriber<T>, invalidate?: Invalidator<T>): Unsubscriber;
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


<!-- @include_end svelte/store -->

<!-- @include_start svelte/transition -->


```js
// @noErrors
import {
	blur,
	crossfade,
	draw,
	fade,
	fly,
	scale,
	slide
} from 'svelte/transition';
```

## blur

Animates a `blur` filter alongside an element's opacity.

https://svelte.dev/docs/svelte-transition#blur

<div class="ts-block">

```ts
// @noErrors
function blur(
	node: Element,
	{
		delay,
		duration,
		easing,
		amount,
		opacity
	}?: BlurParams | undefined
): TransitionConfig;
```

</div>

## crossfade

The `crossfade` function creates a pair of [transitions](https://svelte.dev/docs#template-syntax-element-directives-transition-fn) called `send` and `receive`. When an element is 'sent', it looks for a corresponding element being 'received', and generates a transition that transforms the element to its counterpart's position and fades it out. When an element is 'received', the reverse happens. If there is no counterpart, the `fallback` transition is used.

https://svelte.dev/docs/svelte-transition#crossfade

<div class="ts-block">

```ts
// @noErrors
function crossfade({
	fallback,
	...defaults
}: CrossfadeParams & {
	fallback?: (
		node: Element,
		params: CrossfadeParams,
		intro: boolean
	) => TransitionConfig;
}): [
	(
		node: any,
		params: CrossfadeParams & {
			key: any;
		}
	) => () => TransitionConfig,
	(
		node: any,
		params: CrossfadeParams & {
			key: any;
		}
	) => () => TransitionConfig
];
```

</div>

## draw

Animates the stroke of an SVG element, like a snake in a tube. `in` transitions begin with the path invisible and draw the path to the screen over time. `out` transitions start in a visible state and gradually erase the path. `draw` only works with elements that have a `getTotalLength` method, like `<path>` and `<polyline>`.

https://svelte.dev/docs/svelte-transition#draw

<div class="ts-block">

```ts
// @noErrors
function draw(
	node: SVGElement & {
		getTotalLength(): number;
	},
	{
		delay,
		speed,
		duration,
		easing
	}?: DrawParams | undefined
): TransitionConfig;
```

</div>

## fade

Animates the opacity of an element from 0 to the current opacity for `in` transitions and from the current opacity to 0 for `out` transitions.

https://svelte.dev/docs/svelte-transition#fade

<div class="ts-block">

```ts
// @noErrors
function fade(
	node: Element,
	{ delay, duration, easing }?: FadeParams | undefined
): TransitionConfig;
```

</div>

## fly

Animates the x and y positions and the opacity of an element. `in` transitions animate from the provided values, passed as parameters to the element's default values. `out` transitions animate from the element's default values to the provided values.

https://svelte.dev/docs/svelte-transition#fly

<div class="ts-block">

```ts
// @noErrors
function fly(
	node: Element,
	{
		delay,
		duration,
		easing,
		x,
		y,
		opacity
	}?: FlyParams | undefined
): TransitionConfig;
```

</div>

## scale

Animates the opacity and scale of an element. `in` transitions animate from an element's current (default) values to the provided values, passed as parameters. `out` transitions animate from the provided values to an element's default values.

https://svelte.dev/docs/svelte-transition#scale

<div class="ts-block">

```ts
// @noErrors
function scale(
	node: Element,
	{
		delay,
		duration,
		easing,
		start,
		opacity
	}?: ScaleParams | undefined
): TransitionConfig;
```

</div>

## slide

Slides an element in and out.

https://svelte.dev/docs/svelte-transition#slide

<div class="ts-block">

```ts
// @noErrors
function slide(
	node: Element,
	{
		delay,
		duration,
		easing,
		axis
	}?: SlideParams | undefined
): TransitionConfig;
```

</div>

## BlurParams

<div class="ts-block">

```dts
interface BlurParams {/*…*/}
```

<div class="ts-block-property">

```dts
delay?: number;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
duration?: number;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
easing?: EasingFunction;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
amount?: number | string;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
opacity?: number;
```

<div class="ts-block-property-details"></div>
</div>
</div>

## CrossfadeParams

<div class="ts-block">

```dts
interface CrossfadeParams {/*…*/}
```

<div class="ts-block-property">

```dts
delay?: number;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
duration?: number | ((len: number) => number);
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
easing?: EasingFunction;
```

<div class="ts-block-property-details"></div>
</div>
</div>

## DrawParams

<div class="ts-block">

```dts
interface DrawParams {/*…*/}
```

<div class="ts-block-property">

```dts
delay?: number;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
speed?: number;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
duration?: number | ((len: number) => number);
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
easing?: EasingFunction;
```

<div class="ts-block-property-details"></div>
</div>
</div>

## EasingFunction

<div class="ts-block">

```dts
type EasingFunction = (t: number) => number;
```


</div>

## FadeParams

<div class="ts-block">

```dts
interface FadeParams {/*…*/}
```

<div class="ts-block-property">

```dts
delay?: number;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
duration?: number;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
easing?: EasingFunction;
```

<div class="ts-block-property-details"></div>
</div>
</div>

## FlyParams

<div class="ts-block">

```dts
interface FlyParams {/*…*/}
```

<div class="ts-block-property">

```dts
delay?: number;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
duration?: number;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
easing?: EasingFunction;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
x?: number | string;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
y?: number | string;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
opacity?: number;
```

<div class="ts-block-property-details"></div>
</div>
</div>

## ScaleParams

<div class="ts-block">

```dts
interface ScaleParams {/*…*/}
```

<div class="ts-block-property">

```dts
delay?: number;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
duration?: number;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
easing?: EasingFunction;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
start?: number;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
opacity?: number;
```

<div class="ts-block-property-details"></div>
</div>
</div>

## SlideParams

<div class="ts-block">

```dts
interface SlideParams {/*…*/}
```

<div class="ts-block-property">

```dts
delay?: number;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
duration?: number;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
easing?: EasingFunction;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
axis?: 'x' | 'y';
```

<div class="ts-block-property-details"></div>
</div>
</div>

## TransitionConfig

<div class="ts-block">

```dts
interface TransitionConfig {/*…*/}
```

<div class="ts-block-property">

```dts
delay?: number;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
duration?: number;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
easing?: EasingFunction;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
css?: (t: number, u: number) => string;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
tick?: (t: number, u: number) => void;
```

<div class="ts-block-property-details"></div>
</div>
</div>


<!-- @include_end svelte/transition -->

