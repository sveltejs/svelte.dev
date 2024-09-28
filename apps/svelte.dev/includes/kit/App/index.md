## Error

Defines the common shape of expected and unexpected errors. Expected errors are thrown using the `error` function. Unexpected errors are handled by the `handleError` hooks which should return this shape.

<div class="ts-block">

```dts
interface Error {/*…*/}
```

<div class="ts-block-property">

```dts
message: string;
```

<div class="ts-block-property-details"></div>
</div>
</div>

## Locals

The interface that defines `event.locals`, which can be accessed in [hooks](https://kit.svelte.dev/docs/hooks) (`handle`, and `handleError`), server-only `load` functions, and `+server.js` files.

<div class="ts-block">

```dts
interface Locals {}
```


</div>

## PageData

Defines the common shape of the [$page.data store](/docs/kit/reference/$app-stores#page) - that is, the data that is shared between all pages.
The `Load` and `ServerLoad` functions in `./$types` will be narrowed accordingly.
Use optional properties for data that is only present on specific pages. Do not add an index signature (`[key: string]: any`).

<div class="ts-block">

```dts
interface PageData {}
```


</div>

## PageState

The shape of the `$page.state` object, which can be manipulated using the [`pushState`](/docs/kit/reference/$app-navigation#pushstate) and [`replaceState`](/docs/kit/reference/$app-navigation#replacestate) functions from `$app/navigation`.

<div class="ts-block">

```dts
interface PageState {}
```


</div>

## Platform

If your adapter provides [platform-specific context](https://kit.svelte.dev/docs/adapters#platform-specific-context) via `event.platform`, you can specify it here.

<div class="ts-block">

```dts
interface Platform {}
```


</div>

