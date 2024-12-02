---
title: svelte
---



```js
// @noErrors
import {
	SvelteComponent,
	SvelteComponentTyped,
	afterUpdate,
	beforeUpdate,
	createEventDispatcher,
	createRawSnippet,
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

## SvelteComponent

This was the base class for Svelte components in Svelte 4. Svelte 5+ components
are completely different under the hood. For typing, use `Component` instead.
To instantiate components, use `mount` instead.
See [migration guide](/docs/svelte/v5-migration-guide#Components-are-no-longer-classes) for more info.

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
https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more info.

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
is a stop-gap solution. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes
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
is a stop-gap solution. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes
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
is a stop-gap solution. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes
for more info.

</div>

</div>
</div></div>



## SvelteComponentTyped

<blockquote class="tag deprecated">

Use `Component` instead. See [migration guide](https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes) for more information.

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



## afterUpdate

<blockquote class="tag deprecated">

Use `$effect` instead — see https://svelte.dev/docs/svelte/$effect

</blockquote>

Schedules a callback to run immediately after the component has been updated.

The first time the callback runs will be after the initial `onMount`.

In runes mode use `$effect` instead.

<div class="ts-block">

```dts
function afterUpdate(fn: () => void): void;
```

</div>



## beforeUpdate

<blockquote class="tag deprecated">

Use `$effect.pre` instead — see https://svelte.dev/docs/svelte/$effect#$effect.pre

</blockquote>

Schedules a callback to run immediately before the component is updated after any state change.

The first time the callback runs will be before the initial `onMount`.

In runes mode use `$effect.pre` instead.

<div class="ts-block">

```dts
function beforeUpdate(fn: () => void): void;
```

</div>



## createEventDispatcher

<blockquote class="tag deprecated">

Use callback props and/or the `$host()` rune instead — see https://svelte.dev/docs/svelte/v5-migration-guide#Event-changes-Component-events

</blockquote>

Creates an event dispatcher that can be used to dispatch [component events](/docs/svelte/legacy-on#Component-events).
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

<div class="ts-block">

```dts
function createEventDispatcher<
	EventMap extends Record<string, any> = any
>(): EventDispatcher<EventMap>;
```

</div>



## createRawSnippet

Create a snippet programmatically

<div class="ts-block">

```dts
function createRawSnippet<Params extends unknown[]>(
	fn: (...params: Getters<Params>) => {
		render: () => string;
		setup?: (element: Element) => void | (() => void);
	}
): Snippet<Params>;
```

</div>



## flushSync

Synchronously flushes any pending state changes and those that result from it.

<div class="ts-block">

```dts
function flushSync(fn?: (() => void) | undefined): void;
```

</div>



## getAllContexts

Retrieves the whole context map that belongs to the closest parent component.
Must be called during component initialisation. Useful, for example, if you
programmatically create a component and want to pass the existing context to it.

<div class="ts-block">

```dts
function getAllContexts<
	T extends Map<any, any> = Map<any, any>
>(): T;
```

</div>



## getContext

Retrieves the context that belongs to the closest parent component with the specified `key`.
Must be called during component initialisation.

<div class="ts-block">

```dts
function getContext<T>(key: any): T;
```

</div>



## hasContext

Checks whether a given `key` has been set in the context of a parent component.
Must be called during component initialisation.

<div class="ts-block">

```dts
function hasContext(key: any): boolean;
```

</div>



## hydrate

Hydrates a component on the given target and returns the exports and potentially the props (if compiled with `accessors: true`) of the component

<div class="ts-block">

```dts
function hydrate<
	Props extends Record<string, any>,
	Exports extends Record<string, any>
>(
	component:
		| ComponentType<SvelteComponent<Props>>
		| Component<Props, Exports, any>,
	options: {} extends Props
		? {
				target: Document | Element | ShadowRoot;
				props?: Props;
				events?: Record<string, (e: any) => any>;
				context?: Map<any, any>;
				intro?: boolean;
				recover?: boolean;
			}
		: {
				target: Document | Element | ShadowRoot;
				props: Props;
				events?: Record<string, (e: any) => any>;
				context?: Map<any, any>;
				intro?: boolean;
				recover?: boolean;
			}
): Exports;
```

</div>



## mount

Mounts a component to the given target and returns the exports and potentially the props (if compiled with `accessors: true`) of the component.
Transitions will play during the initial render unless the `intro` option is set to `false`.

<div class="ts-block">

```dts
function mount<
	Props extends Record<string, any>,
	Exports extends Record<string, any>
>(
	component:
		| ComponentType<SvelteComponent<Props>>
		| Component<Props, Exports, any>,
	options: MountOptions<Props>
): Exports;
```

</div>



## onDestroy

Schedules a callback to run immediately before the component is unmounted.

Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
only one that runs inside a server-side component.

<div class="ts-block">

```dts
function onDestroy(fn: () => any): void;
```

</div>



## onMount

The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
It must be called during the component's initialisation (but doesn't need to live *inside* the component;
it can be called from an external module).

If a function is returned _synchronously_ from `onMount`, it will be called when the component is unmounted.

`onMount` does not run inside [server-side components](/docs/svelte/svelte-server#render).

<div class="ts-block">

```dts
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

<div class="ts-block">

```dts
function setContext<T>(key: any, context: T): T;
```

</div>



## tick

Returns a promise that resolves once any pending state changes have been applied.

<div class="ts-block">

```dts
function tick(): Promise<void>;
```

</div>



## unmount

Unmounts a component that was previously mounted using `mount` or `hydrate`.

<div class="ts-block">

```dts
function unmount(component: Record<string, any>): void;
```

</div>



## untrack

When used inside a [`$derived`](/docs/svelte/$derived) or [`$effect`](/docs/svelte/$effect),
any state read inside `fn` will not be treated as a dependency.

```ts
$effect(() => {
	// this will run when `data` changes, but not when `time` changes
	save(data, {
		timestamp: untrack(() => time)
	});
});
```

<div class="ts-block">

```dts
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
	this: void,
	internals: ComponentInternals,
	props: Props
): {
	/**
	 * @deprecated This method only exists when using one of the legacy compatibility helpers, which
	 * is a stop-gap solution. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes
	 * for more info.
	 */
	$on?(type: string, callback: (e: any) => void): () => void;
	/**
	 * @deprecated This method only exists when using one of the legacy compatibility helpers, which
	 * is a stop-gap solution. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes
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
</div></div>

## ComponentConstructorOptions

<blockquote class="tag deprecated">

In Svelte 4, components are classes. In Svelte 5, they are functions.
Use `mount` instead to instantiate components.
See [migration guide](https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes)
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
recover?: boolean;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
sync?: boolean;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
$$inline?: boolean;
```

<div class="ts-block-property-details"></div>
</div></div>

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

## ComponentInternals

Internal implementation details that vary between environments

<div class="ts-block">

```dts
type ComponentInternals = Branded<{}, 'ComponentInternals'>;
```

</div>

## ComponentProps

Convenience type to get the props the given component expects.

Example: Ensure a variable contains the props expected by `MyComponent`:

```ts
import type { ComponentProps } from 'svelte';
import MyComponent from './MyComponent.svelte';

// Errors if these aren't the correct props expected by MyComponent.
const props: ComponentProps<typeof MyComponent> = { foo: 'bar' };
```

> [!NOTE] In Svelte 4, you would do `ComponentProps<MyComponent>` because `MyComponent` was a class.

Example: A generic function that accepts some component and infers the type of its props:

```ts
import type { Component, ComponentProps } from 'svelte';
import MyComponent from './MyComponent.svelte';

function withProps<TComponent extends Component<any>>(
	component: TComponent,
	props: ComponentProps<TComponent>
) {};

// Errors if the second argument is not the correct props expected by the component in the first argument.
withProps(MyComponent, { foo: 'bar' });
```

<div class="ts-block">

```dts
type ComponentProps<
	Comp extends SvelteComponent | Component<any, any>
> =
	Comp extends SvelteComponent<infer Props>
		? Props
		: Comp extends Component<infer Props, any>
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
</div></div>

## MountOptions

Defines the options accepted by the `mount()` function.

<div class="ts-block">

```dts
type MountOptions<
	Props extends Record<string, any> = Record<string, any>
> = {
	/**
	 * Target element where the component will be mounted.
	 */
	target: Document | Element | ShadowRoot;
	/**
	 * Optional node inside `target`. When specified, it is used to render the component immediately before it.
	 */
	anchor?: Node;
	/**
	 * Allows the specification of events.
	 * @deprecated Use callback props instead.
	 */
	events?: Record<string, (e: any) => any>;
	/**
	 * Can be accessed via `getContext()` at the component level.
	 */
	context?: Map<any, any>;
	/**
	 * Whether or not to play transitions on initial render.
	 * @default true
	 */
	intro?: boolean;
} & ({} extends Props
	? {
			/**
			 * Component properties.
			 */
			props?: Props;
		}
	: {
			/**
			 * Component properties.
			 */
			props: Props;
		});
```

</div>

## Snippet

The type of a `#snippet` block. You can use it to (for example) express that your component expects a snippet of a certain type:
```ts
let { banner }: { banner: Snippet<[{ text: string }]> } = $props();
```
You can only call a snippet through the `{@render ...}` tag.

/docs/svelte/snippet

<div class="ts-block">

```dts
interface Snippet<Parameters extends unknown[] = []> {/*…*/}
```

<div class="ts-block-property">

```dts
(
	this: void,
	// this conditional allows tuples but not arrays. Arrays would indicate a
	// rest parameter type, which is not supported. If rest parameters are added
	// in the future, the condition can be removed.
	...args: number extends Parameters['length'] ? never : Parameters
): {
	'{@render ...} must be called with a Snippet': "import type { Snippet } from 'svelte'";
} & typeof SnippetReturn;
```

<div class="ts-block-property-details"></div>
</div></div>


