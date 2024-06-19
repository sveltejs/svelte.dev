---
title: Generated Reference
---

This file is generated. Do not edit. If you are doing a translation, remove the include comments in the other .md files instead and replace it with the translated output.

<!-- @include_start $app/environment -->


```js
// @noErrors
import { browser, building, dev, version } from '$app/environment';
```

## browser

`true` if the app is running in the browser.

<div class="ts-block">

```ts
// @noErrors
const browser: boolean;
```

</div>

## building

SvelteKit analyses your app during the `build` step by running it. During this process, `building` is `true`. This also applies during prerendering.

<div class="ts-block">

```ts
// @noErrors
const building: boolean;
```

</div>

## dev

Whether the dev server is running. This is not guaranteed to correspond to `NODE_ENV` or `MODE`.

<div class="ts-block">

```ts
// @noErrors
const dev: boolean;
```

</div>

## version

The value of `config.kit.version.name`.

<div class="ts-block">

```ts
// @noErrors
const version: string;
```

</div>


<!-- @include_end $app/environment -->

<!-- @include_start $app/forms -->


```js
// @noErrors
import { applyAction, deserialize, enhance } from '$app/forms';
```

## applyAction

This action updates the `form` property of the current page with the given data and updates `$page.status`.
In case of an error, it redirects to the nearest error page.

<div class="ts-block">

```ts
// @noErrors
function applyAction<
	Success extends Record<string, unknown> | undefined,
	Failure extends Record<string, unknown> | undefined
>(
	result: import('@sveltejs/kit').ActionResult<
		Success,
		Failure
	>
): Promise<void>;
```

</div>

## deserialize

Use this function to deserialize the response from a form submission.
Usage:

```js
// @errors: 7031
import { deserialize } from '$app/forms';

async function handleSubmit(event) {
  const response = await fetch('/form?/action', {
    method: 'POST',
    body: new FormData(event.target)
  });

  const result = deserialize(await response.text());
  // ...
}
```

<div class="ts-block">

```ts
// @noErrors
function deserialize<
	Success extends Record<string, unknown> | undefined,
	Failure extends Record<string, unknown> | undefined
>(
	result: string
): import('@sveltejs/kit').ActionResult<Success, Failure>;
```

</div>

## enhance

This action enhances a `<form>` element that otherwise would work without JavaScript.

The `submit` function is called upon submission with the given FormData and the `action` that should be triggered.
If `cancel` is called, the form will not be submitted.
You can use the abort `controller` to cancel the submission in case another one starts.
If a function is returned, that function is called with the response from the server.
If nothing is returned, the fallback will be used.

If this function or its return value isn't set, it
- falls back to updating the `form` prop with the returned data if the action is one same page as the form
- updates `$page.status`
- resets the `<form>` element and invalidates all data in case of successful submission with no redirect response
- redirects in case of a redirect response
- redirects to the nearest error page in case of an unexpected error

If you provide a custom function with a callback and want to use the default behavior, invoke `update` in your callback.

<div class="ts-block">

```ts
// @noErrors
function enhance<
	Success extends Record<string, unknown> | undefined,
	Failure extends Record<string, unknown> | undefined
>(
	form_element: HTMLFormElement,
	submit?: import('@sveltejs/kit').SubmitFunction<
		Success,
		Failure
	>
): {
	destroy(): void;
};
```

</div>


<!-- @include_end $app/forms -->

<!-- @include_start $app/navigation -->


```js
// @noErrors
import {
	afterNavigate,
	beforeNavigate,
	disableScrollHandling,
	goto,
	invalidate,
	invalidateAll,
	onNavigate,
	preloadCode,
	preloadData,
	pushState,
	replaceState
} from '$app/navigation';
```

## afterNavigate

A lifecycle function that runs the supplied `callback` when the current component mounts, and also whenever we navigate to a new URL.

`afterNavigate` must be called during a component initialization. It remains active as long as the component is mounted.

<div class="ts-block">

```ts
// @noErrors
function afterNavigate(
	callback: (
		navigation: import('@sveltejs/kit').AfterNavigate
	) => void
): void;
```

</div>

## beforeNavigate

A navigation interceptor that triggers before we navigate to a new URL, whether by clicking a link, calling `goto(...)`, or using the browser back/forward controls.

Calling `cancel()` will prevent the navigation from completing. If `navigation.type === 'leave'` — meaning the user is navigating away from the app (or closing the tab) — calling `cancel` will trigger the native browser unload confirmation dialog. In this case, the navigation may or may not be cancelled depending on the user's response.

When a navigation isn't to a SvelteKit-owned route (and therefore controlled by SvelteKit's client-side router), `navigation.to.route.id` will be `null`.

If the navigation will (if not cancelled) cause the document to unload — in other words `'leave'` navigations and `'link'` navigations where `navigation.to.route === null` — `navigation.willUnload` is `true`.

`beforeNavigate` must be called during a component initialization. It remains active as long as the component is mounted.

<div class="ts-block">

```ts
// @noErrors
function beforeNavigate(
	callback: (
		navigation: import('@sveltejs/kit').BeforeNavigate
	) => void
): void;
```

</div>

## disableScrollHandling

If called when the page is being updated following a navigation (in `onMount` or `afterNavigate` or an action, for example), this disables SvelteKit's built-in scroll handling.
This is generally discouraged, since it breaks user expectations.

<div class="ts-block">

```ts
// @noErrors
function disableScrollHandling(): void;
```

</div>

## goto

Returns a Promise that resolves when SvelteKit navigates (or fails to navigate, in which case the promise rejects) to the specified `url`.
For external URLs, use `window.location = url` instead of calling `goto(url)`.

<div class="ts-block">

```ts
// @noErrors
function goto(
	url: string | URL,
	opts?:
		| {
				replaceState?: boolean | undefined;
				noScroll?: boolean | undefined;
				keepFocus?: boolean | undefined;
				invalidateAll?: boolean | undefined;
				state?: App.PageState | undefined;
		  }
		| undefined
): Promise<void>;
```

</div>

## invalidate

Causes any `load` functions belonging to the currently active page to re-run if they depend on the `url` in question, via `fetch` or `depends`. Returns a `Promise` that resolves when the page is subsequently updated.

If the argument is given as a `string` or `URL`, it must resolve to the same URL that was passed to `fetch` or `depends` (including query parameters).
To create a custom identifier, use a string beginning with `[a-z]+:` (e.g. `custom:state`) — this is a valid URL.

The `function` argument can be used define a custom predicate. It receives the full `URL` and causes `load` to rerun if `true` is returned.
This can be useful if you want to invalidate based on a pattern instead of a exact match.

```ts
// Example: Match '/path' regardless of the query parameters
import { invalidate } from '$app/navigation';

invalidate((url) => url.pathname === '/path');
```

<div class="ts-block">

```ts
// @noErrors
function invalidate(
	resource: string | URL | ((url: URL) => boolean)
): Promise<void>;
```

</div>

## invalidateAll

Causes all `load` functions belonging to the currently active page to re-run. Returns a `Promise` that resolves when the page is subsequently updated.

<div class="ts-block">

```ts
// @noErrors
function invalidateAll(): Promise<void>;
```

</div>

## onNavigate

A lifecycle function that runs the supplied `callback` immediately before we navigate to a new URL except during full-page navigations.

If you return a `Promise`, SvelteKit will wait for it to resolve before completing the navigation. This allows you to — for example — use `document.startViewTransition`. Avoid promises that are slow to resolve, since navigation will appear stalled to the user.

If a function (or a `Promise` that resolves to a function) is returned from the callback, it will be called once the DOM has updated.

`onNavigate` must be called during a component initialization. It remains active as long as the component is mounted.

<div class="ts-block">

```ts
// @noErrors
function onNavigate(
	callback: (
		navigation: import('@sveltejs/kit').OnNavigate
	) => MaybePromise<(() => void) | void>
): void;
```

</div>

## preloadCode

Programmatically imports the code for routes that haven't yet been fetched.
Typically, you might call this to speed up subsequent navigation.

You can specify routes by any matching pathname such as `/about` (to match `src/routes/about/+page.svelte`) or `/blog/*` (to match `src/routes/blog/[slug]/+page.svelte`).

Unlike `preloadData`, this won't call `load` functions.
Returns a Promise that resolves when the modules have been imported.

<div class="ts-block">

```ts
// @noErrors
function preloadCode(pathname: string): Promise<void>;
```

</div>

## preloadData

Programmatically preloads the given page, which means
 1. ensuring that the code for the page is loaded, and
 2. calling the page's load function with the appropriate options.

This is the same behaviour that SvelteKit triggers when the user taps or mouses over an `<a>` element with `data-sveltekit-preload-data`.
If the next navigation is to `href`, the values returned from load will be used, making navigation instantaneous.
Returns a Promise that resolves with the result of running the new route's `load` functions once the preload is complete.

<div class="ts-block">

```ts
// @noErrors
function preloadData(href: string): Promise<
	| {
			type: 'loaded';
			status: number;
			data: Record<string, any>;
	  }
	| {
			type: 'redirect';
			location: string;
	  }
>;
```

</div>

## pushState

Programmatically create a new history entry with the given `$page.state`. To use the current URL, you can pass `''` as the first argument. Used for [shallow routing](https://kit.svelte.dev/docs/shallow-routing).

<div class="ts-block">

```ts
// @noErrors
function pushState(
	url: string | URL,
	state: App.PageState
): void;
```

</div>

## replaceState

Programmatically replace the current history entry with the given `$page.state`. To use the current URL, you can pass `''` as the first argument. Used for [shallow routing](https://kit.svelte.dev/docs/shallow-routing).

<div class="ts-block">

```ts
// @noErrors
function replaceState(
	url: string | URL,
	state: App.PageState
): void;
```

</div>


<!-- @include_end $app/navigation -->

<!-- @include_start $app/paths -->


```js
// @noErrors
import { assets, base, resolveRoute } from '$app/paths';
```

## assets

An absolute path that matches [`config.kit.paths.assets`](/docs/kit/reference/configuration#paths).

> If a value for `config.kit.paths.assets` is specified, it will be replaced with `'/_svelte_kit_assets'` during `vite dev` or `vite preview`, since the assets don't yet live at their eventual URL.

<div class="ts-block">

```ts
// @noErrors
let assets:
	| ''
	| `https://${string}`
	| `http://${string}`
	| '/_svelte_kit_assets';
```

</div>

## base

A string that matches [`config.kit.paths.base`](/docs/kit/reference/configuration#paths).

Example usage: `<a href="{base}/your-page">Link</a>`

<div class="ts-block">

```ts
// @noErrors
let base: '' | `/${string}`;
```

</div>

## resolveRoute

Populate a route ID with params to resolve a pathname.

<div class="ts-block">

```ts
// @noErrors
function resolveRoute(
	id: string,
	params: Record<string, string | undefined>
): string;
```

</div>


<!-- @include_end $app/paths -->

<!-- @include_start $app/server -->


```js
// @noErrors
import { read } from '$app/server';
```

## read

Read the contents of an imported asset from the filesystem

<div class="ts-block">

```ts
// @noErrors
function read(asset: string): Response;
```

</div>


<!-- @include_end $app/server -->

<!-- @include_start $app/stores -->


```js
// @noErrors
import { getStores, navigating, page, updated } from '$app/stores';
```

## getStores



<div class="ts-block">

```ts
// @noErrors
function getStores(): {
	page: typeof page;

	navigating: typeof navigating;

	updated: typeof updated;
};
```

</div>

## navigating

A readable store.
When navigating starts, its value is a `Navigation` object with `from`, `to`, `type` and (if `type === 'popstate'`) `delta` properties.
When navigating finishes, its value reverts to `null`.

On the server, this store can only be subscribed to during component initialization. In the browser, it can be subscribed to at any time.

<div class="ts-block">

```ts
// @noErrors
const navigating: import('svelte/store').Readable<
	import('@sveltejs/kit').Navigation | null
>;
```

</div>

## page

A readable store whose value contains page data.

On the server, this store can only be subscribed to during component initialization. In the browser, it can be subscribed to at any time.

<div class="ts-block">

```ts
// @noErrors
const page: import('svelte/store').Readable<
	import('@sveltejs/kit').Page
>;
```

</div>

## updated

A readable store whose initial value is `false`. If [`version.pollInterval`](/docs/kit/reference/configuration#version) is a non-zero value, SvelteKit will poll for new versions of the app and update the store value to `true` when it detects one. `updated.check()` will force an immediate check, regardless of polling.

On the server, this store can only be subscribed to during component initialization. In the browser, it can be subscribed to at any time.

<div class="ts-block">

```ts
// @noErrors
const updated: import('svelte/store').Readable<boolean> & {
	check(): Promise<boolean>;
};
```

</div>


<!-- @include_end $app/stores -->

<!-- @include_start $env/dynamic/private -->
This module provides access to runtime environment variables, as defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](/docs/kit/reference/cli)), this is equivalent to `process.env`. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](/docs/kit/reference/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](/docs/kit/reference/configuration#env) (if configured).

This module cannot be imported into client-side code.

Dynamic environment variables cannot be used during prerendering.

```ts
import { env } from '$env/dynamic/private';
console.log(env.DEPLOYMENT_SPECIFIC_VARIABLE);
```

> In `dev`, `$env/dynamic` always includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.



<!-- @include_end $env/dynamic/private -->

<!-- @include_start $env/dynamic/public -->
Similar to [`$env/dynamic/private`](/docs/kit/reference/$env-all#$env-dynamic-private), but only includes variables that begin with [`config.kit.env.publicPrefix`](/docs/kit/reference/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.

Note that public dynamic environment variables must all be sent from the server to the client, causing larger network requests — when possible, use `$env/static/public` instead.

Dynamic environment variables cannot be used during prerendering.

```ts
import { env } from '$env/dynamic/public';
console.log(env.PUBLIC_DEPLOYMENT_SPECIFIC_VARIABLE);
```



<!-- @include_end $env/dynamic/public -->

<!-- @include_start $env/static/private -->
Environment variables [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env`. Like [`$env/dynamic/private`](/docs/kit/reference/$env-all#$env-dynamic-private), this module cannot be imported into client-side code. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](/docs/kit/reference/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](/docs/kit/reference/configuration#env) (if configured).

_Unlike_ [`$env/dynamic/private`](/docs/kit/reference/$env-all#$env-dynamic-private), the values exported from this module are statically injected into your bundle at build time, enabling optimisations like dead code elimination.

```ts
import { API_KEY } from '$env/static/private';
```

Note that all environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:

```
MY_FEATURE_FLAG=""
```

You can override `.env` values from the command line like so:

```bash
MY_FEATURE_FLAG="enabled" npm run dev
```



<!-- @include_end $env/static/private -->

<!-- @include_start $env/static/public -->
Similar to [`$env/static/private`](/docs/kit/reference/$env-all#$env-static-private), except that it only includes environment variables that begin with [`config.kit.env.publicPrefix`](/docs/kit/reference/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.

Values are replaced statically at build time.

```ts
import { PUBLIC_BASE_URL } from '$env/static/public';
```



<!-- @include_end $env/static/public -->

<!-- @include_start $lib -->
This is a simple alias to `src/lib`, or whatever directory is specified as [`config.kit.files.lib`](/docs/kit/reference/configuration#files). It allows you to access common components and utility modules without `../../../../` nonsense.

### `$lib/server`

A subdirectory of `$lib`. SvelteKit will prevent you from importing any modules in `$lib/server` into client-side code. See [server-only modules](/docs/server-only-modules).



<!-- @include_end $lib -->

<!-- @include_start $service-worker -->


```js
// @noErrors
import { base, build, files, prerendered, version } from '$service-worker';
```

This module is only available to [service workers](/docs/service-workers).

## base

The `base` path of the deployment. Typically this is equivalent to `config.kit.paths.base`, but it is calculated from `location.pathname` meaning that it will continue to work correctly if the site is deployed to a subdirectory.
Note that there is a `base` but no `assets`, since service workers cannot be used if `config.kit.paths.assets` is specified.

<div class="ts-block">

```ts
// @noErrors
const base: string;
```

</div>

## build

An array of URL strings representing the files generated by Vite, suitable for caching with `cache.addAll(build)`.
During development, this is an empty array.

<div class="ts-block">

```ts
// @noErrors
const build: string[];
```

</div>

## files

An array of URL strings representing the files in your static directory, or whatever directory is specified by `config.kit.files.assets`. You can customize which files are included from `static` directory using [`config.kit.serviceWorker.files`](/docs/kit/reference/configuration)

<div class="ts-block">

```ts
// @noErrors
const files: string[];
```

</div>

## prerendered

An array of pathnames corresponding to prerendered pages and endpoints.
During development, this is an empty array.

<div class="ts-block">

```ts
// @noErrors
const prerendered: string[];
```

</div>

## version

See [`config.kit.version`](/docs/kit/reference/configuration#version). It's useful for generating unique cache names inside your service worker, so that a later deployment of your app can invalidate old caches.

<div class="ts-block">

```ts
// @noErrors
const version: string;
```

</div>


<!-- @include_end $service-worker -->

<!-- @include_start @sveltejs/kit -->


```js
// @noErrors
import {
	VERSION,
	error,
	fail,
	isHttpError,
	isRedirect,
	json,
	redirect,
	text
} from '@sveltejs/kit';
```

## VERSION



<div class="ts-block">

```ts
// @noErrors
const VERSION: string;
```

</div>

## error

Throws an error with a HTTP status code and an optional message.
When called during request handling, this will cause SvelteKit to
return an error response without invoking `handleError`.
Make sure you're not catching the thrown error, which would prevent SvelteKit from handling it.

<div class="ts-block">

```ts
// @noErrors
function error(status: number, body: App.Error): never;
```

</div>

## error

Throws an error with a HTTP status code and an optional message.
When called during request handling, this will cause SvelteKit to
return an error response without invoking `handleError`.
Make sure you're not catching the thrown error, which would prevent SvelteKit from handling it.

<div class="ts-block">

```ts
// @noErrors
function error(
	status: number,
	body?: {
		message: string;
	} extends App.Error
		? App.Error | string | undefined
		: never
): never;
```

</div>

## fail

Create an `ActionFailure` object.

<div class="ts-block">

```ts
// @noErrors
function fail(status: number): ActionFailure<undefined>;
```

</div>

## fail

Create an `ActionFailure` object.

<div class="ts-block">

```ts
// @noErrors
function fail<
	T extends Record<string, unknown> | undefined = undefined
>(status: number, data: T): ActionFailure<T>;
```

</div>

## isHttpError

Checks whether this is an error thrown by `error`.

<div class="ts-block">

```ts
// @noErrors
function isHttpError<T extends number>(
	e: unknown,
	status?: T | undefined
): e is HttpError_1 & {
	status: T extends undefined ? never : T;
};
```

</div>

## isRedirect

Checks whether this is a redirect thrown by `redirect`.

<div class="ts-block">

```ts
// @noErrors
function isRedirect(e: unknown): e is Redirect_1;
```

</div>

## json

Create a JSON `Response` object from the supplied data.

<div class="ts-block">

```ts
// @noErrors
function json(
	data: any,
	init?: ResponseInit | undefined
): Response;
```

</div>

## redirect

Redirect a request. When called during request handling, SvelteKit will return a redirect response.
Make sure you're not catching the thrown redirect, which would prevent SvelteKit from handling it.

<div class="ts-block">

```ts
// @noErrors
function redirect(
	status:
		| 300
		| 301
		| 302
		| 303
		| 304
		| 305
		| 306
		| 307
		| 308
		| ({} & number),
	location: string | URL
): never;
```

</div>

## text

Create a `Response` object from the supplied body.

<div class="ts-block">

```ts
// @noErrors
function text(
	body: string,
	init?: ResponseInit | undefined
): Response;
```

</div>

## Action

Shape of a form action method that is part of `export const actions = {..}` in `+page.server.js`.
See [form actions](https://kit.svelte.dev/docs/form-actions) for more information.

<div class="ts-block">

```dts
type Action<
	Params extends Partial<Record<string, string>> = Partial<
		Record<string, string>
	>,
	OutputData extends Record<string, any> | void = Record<
		string,
		any
	> | void,
	RouteId extends string | null = string | null
> = (
	event: RequestEvent<Params, RouteId>
) => MaybePromise<OutputData>;
```


</div>

## ActionFailure

<div class="ts-block">

```dts
interface ActionFailure<
	T extends Record<string, unknown> | undefined = undefined
> {/*…*/}
```

<div class="ts-block-property">

```dts
status: number;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
data: T;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
[uniqueSymbol]: true;
```

<div class="ts-block-property-details"></div>
</div>
</div>

## ActionResult

When calling a form action via fetch, the response will be one of these shapes.
```svelte
<form method="post" use:enhance={() => {
  return ({ result }) => {
		// result is of type ActionResult
  };
}}
```

<div class="ts-block">

```dts
type ActionResult<
	Success extends
		| Record<string, unknown>
		| undefined = Record<string, any>,
	Failure extends
		| Record<string, unknown>
		| undefined = Record<string, any>
> =
	| { type: 'success'; status: number; data?: Success }
	| { type: 'failure'; status: number; data?: Failure }
	| { type: 'redirect'; status: number; location: string }
	| { type: 'error'; status?: number; error: any };
```


</div>

## Actions

Shape of the `export const actions = {..}` object in `+page.server.js`.
See [form actions](https://kit.svelte.dev/docs/form-actions) for more information.

<div class="ts-block">

```dts
type Actions<
	Params extends Partial<Record<string, string>> = Partial<
		Record<string, string>
	>,
	OutputData extends Record<string, any> | void = Record<
		string,
		any
	> | void,
	RouteId extends string | null = string | null
> = Record<string, Action<Params, OutputData, RouteId>>;
```


</div>

## Adapter

[Adapters](https://kit.svelte.dev/docs/adapters) are responsible for taking the production build and turning it into something that can be deployed to a platform of your choosing.

<div class="ts-block">

```dts
interface Adapter {/*…*/}
```

<div class="ts-block-property">

```dts
name: string;
```

<div class="ts-block-property-details">

The name of the adapter, using for logging. Will typically correspond to the package name.

</div>
</div>

<div class="ts-block-property">

```dts
adapt(builder: Builder): MaybePromise<void>;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- `builder` An object provided by SvelteKit that contains methods for adapting the app

</div>

This function is called after SvelteKit has built your app.

</div>
</div>

<div class="ts-block-property">

```dts
supports?: {/*…*/}
```

<div class="ts-block-property-details">

Checks called during dev and build to determine whether specific features will work in production with this adapter

<div class="ts-block-property-children"><div class="ts-block-property">

```dts
read?: (details: { config: any; route: { id: string } }) => boolean;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- `config` The merged route config

</div>

Test support for `read` from `$app/server`

</div>
</div></div>

</div>
</div>

<div class="ts-block-property">

```dts
emulate?(): MaybePromise<Emulator>;
```

<div class="ts-block-property-details">

Creates an `Emulator`, which allows the adapter to influence the environment
during dev, build and prerendering

</div>
</div>
</div>

## AfterNavigate

The argument passed to [`afterNavigate`](/docs/kit/reference/$app-navigation#afternavigate) callbacks.

<div class="ts-block">

```dts
interface AfterNavigate extends Omit<Navigation, 'type'> {/*…*/}
```

<div class="ts-block-property">

```dts
type: Exclude<NavigationType, 'leave'>;
```

<div class="ts-block-property-details">

The type of navigation:
- `enter`: The app has hydrated
- `form`: The user submitted a `<form>`
- `link`: Navigation was triggered by a link click
- `goto`: Navigation was triggered by a `goto(...)` call or a redirect
- `popstate`: Navigation was triggered by back/forward navigation

</div>
</div>

<div class="ts-block-property">

```dts
willUnload: false;
```

<div class="ts-block-property-details">

Since `afterNavigate` callbacks are called after a navigation completes, they will never be called with a navigation that unloads the page.

</div>
</div>
</div>

## AwaitedActions

<div class="ts-block">

```dts
type AwaitedActions<
	T extends Record<string, (...args: any) => any>
> = OptionalUnion<
	{
		[Key in keyof T]: UnpackValidationError<
			Awaited<ReturnType<T[Key]>>
		>;
	}[keyof T]
>;
```


</div>

## BeforeNavigate

The argument passed to [`beforeNavigate`](/docs/kit/reference/$app-navigation#beforenavigate) callbacks.

<div class="ts-block">

```dts
interface BeforeNavigate extends Navigation {/*…*/}
```

<div class="ts-block-property">

```dts
cancel(): void;
```

<div class="ts-block-property-details">

Call this to prevent the navigation from starting.

</div>
</div>
</div>

## Builder

This object is passed to the `adapt` function of adapters.
It contains various methods and properties that are useful for adapting the app.

<div class="ts-block">

```dts
interface Builder {/*…*/}
```

<div class="ts-block-property">

```dts
log: Logger;
```

<div class="ts-block-property-details">

Print messages to the console. `log.info` and `log.minor` are silent unless Vite's `logLevel` is `info`.

</div>
</div>

<div class="ts-block-property">

```dts
rimraf(dir: string): void;
```

<div class="ts-block-property-details">

Remove `dir` and all its contents.

</div>
</div>

<div class="ts-block-property">

```dts
mkdirp(dir: string): void;
```

<div class="ts-block-property-details">

Create `dir` and any required parent directories.

</div>
</div>

<div class="ts-block-property">

```dts
config: ValidatedConfig;
```

<div class="ts-block-property-details">

The fully resolved `svelte.config.js`.

</div>
</div>

<div class="ts-block-property">

```dts
prerendered: Prerendered;
```

<div class="ts-block-property-details">

Information about prerendered pages and assets, if any.

</div>
</div>

<div class="ts-block-property">

```dts
routes: RouteDefinition[];
```

<div class="ts-block-property-details">

An array of all routes (including prerendered)

</div>
</div>

<div class="ts-block-property">

```dts
createEntries(fn: (route: RouteDefinition) => AdapterEntry): Promise<void>;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- `fn` A function that groups a set of routes into an entry point
- <span class="tag deprecated">deprecated</span> Use `builder.routes` instead

</div>

Create separate functions that map to one or more routes of your app.

</div>
</div>

<div class="ts-block-property">

```dts
findServerAssets(routes: RouteDefinition[]): string[];
```

<div class="ts-block-property-details">

Find all the assets imported by server files belonging to `routes`

</div>
</div>

<div class="ts-block-property">

```dts
generateFallback(dest: string): Promise<void>;
```

<div class="ts-block-property-details">

Generate a fallback page for a static webserver to use when no route is matched. Useful for single-page apps.

</div>
</div>

<div class="ts-block-property">

```dts
generateEnvModule(): void;
```

<div class="ts-block-property-details">

Generate a module exposing build-time environment variables as `$env/dynamic/public`.

</div>
</div>

<div class="ts-block-property">

```dts
generateManifest(opts: { relativePath: string; routes?: RouteDefinition[] }): string;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- `opts` a relative path to the base directory of the app and optionally in which format (esm or cjs) the manifest should be generated

</div>

Generate a server-side manifest to initialise the SvelteKit [server](/docs/kit/reference/types#public-types-server) with.

</div>
</div>

<div class="ts-block-property">

```dts
getBuildDirectory(name: string): string;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- `name` path to the file, relative to the build directory

</div>

Resolve a path to the `name` directory inside `outDir`, e.g. `/path/to/.svelte-kit/my-adapter`.

</div>
</div>

<div class="ts-block-property">

```dts
getClientDirectory(): string;
```

<div class="ts-block-property-details">

Get the fully resolved path to the directory containing client-side assets, including the contents of your `static` directory.

</div>
</div>

<div class="ts-block-property">

```dts
getServerDirectory(): string;
```

<div class="ts-block-property-details">

Get the fully resolved path to the directory containing server-side code.

</div>
</div>

<div class="ts-block-property">

```dts
getAppPath(): string;
```

<div class="ts-block-property-details">

Get the application path including any configured `base` path, e.g. `my-base-path/_app`.

</div>
</div>

<div class="ts-block-property">

```dts
writeClient(dest: string): string[];
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- `dest` the destination folder
- <span class="tag">returns</span> an array of files written to `dest`

</div>

Write client assets to `dest`.

</div>
</div>

<div class="ts-block-property">

```dts
writePrerendered(dest: string): string[];
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- `dest` the destination folder
- <span class="tag">returns</span> an array of files written to `dest`

</div>

Write prerendered files to `dest`.

</div>
</div>

<div class="ts-block-property">

```dts
writeServer(dest: string): string[];
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- `dest` the destination folder
- <span class="tag">returns</span> an array of files written to `dest`

</div>

Write server-side code to `dest`.

</div>
</div>

<div class="ts-block-property">

```dts
copy(
	from: string,
	to: string,
	opts?: {
		filter?(basename: string): boolean;
		replace?: Record<string, string>;
	}
): string[];
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- `from` the source file or directory
- `to` the destination file or directory
- `opts.filter` a function to determine whether a file or directory should be copied
- `opts.replace` a map of strings to replace
- <span class="tag">returns</span> an array of files that were copied

</div>

Copy a file or directory.

</div>
</div>

<div class="ts-block-property">

```dts
compress(directory: string): Promise<void>;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- `directory` The directory containing the files to be compressed

</div>

Compress files in `directory` with gzip and brotli, where appropriate. Generates `.gz` and `.br` files alongside the originals.

</div>
</div>
</div>

## Config

See the [configuration reference](/docs/reference/configuration) for details.

## Cookies

<div class="ts-block">

```dts
interface Cookies {/*…*/}
```

<div class="ts-block-property">

```dts
get(name: string, opts?: import('cookie').CookieParseOptions): string | undefined;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- `name` the name of the cookie
- `opts` the options, passed directly to `cookie.parse`. See documentation [here](https://github.com/jshttp/cookie#cookieparsestr-options)

</div>

Gets a cookie that was previously set with `cookies.set`, or from the request headers.

</div>
</div>

<div class="ts-block-property">

```dts
getAll(opts?: import('cookie').CookieParseOptions): Array<{ name: string; value: string }>;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- `opts` the options, passed directly to `cookie.parse`. See documentation [here](https://github.com/jshttp/cookie#cookieparsestr-options)

</div>

Gets all cookies that were previously set with `cookies.set`, or from the request headers.

</div>
</div>

<div class="ts-block-property">

```dts
set(
	name: string,
	value: string,
	opts: import('cookie').CookieSerializeOptions & { path: string }
): void;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- `name` the name of the cookie
- `value` the cookie value
- `opts` the options, passed directly to `cookie.serialize`. See documentation [here](https://github.com/jshttp/cookie#cookieserializename-value-options)

</div>

Sets a cookie. This will add a `set-cookie` header to the response, but also make the cookie available via `cookies.get` or `cookies.getAll` during the current request.

The `httpOnly` and `secure` options are `true` by default (except on http://localhost, where `secure` is `false`), and must be explicitly disabled if you want cookies to be readable by client-side JavaScript and/or transmitted over HTTP. The `sameSite` option defaults to `lax`.

You must specify a `path` for the cookie. In most cases you should explicitly set `path: '/'` to make the cookie available throughout your app. You can use relative paths, or set `path: ''` to make the cookie only available on the current path and its children

</div>
</div>

<div class="ts-block-property">

```dts
delete(name: string, opts: import('cookie').CookieSerializeOptions & { path: string }): void;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- `name` the name of the cookie
- `opts` the options, passed directly to `cookie.serialize`. The `path` must match the path of the cookie you want to delete. See documentation [here](https://github.com/jshttp/cookie#cookieserializename-value-options)

</div>

Deletes a cookie by setting its value to an empty string and setting the expiry date in the past.

You must specify a `path` for the cookie. In most cases you should explicitly set `path: '/'` to make the cookie available throughout your app. You can use relative paths, or set `path: ''` to make the cookie only available on the current path and its children

</div>
</div>

<div class="ts-block-property">

```dts
serialize(
	name: string,
	value: string,
	opts: import('cookie').CookieSerializeOptions & { path: string }
): string;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- `name` the name of the cookie
- `value` the cookie value
- `opts` the options, passed directly to `cookie.serialize`. See documentation [here](https://github.com/jshttp/cookie#cookieserializename-value-options)

</div>

Serialize a cookie name-value pair into a `Set-Cookie` header string, but don't apply it to the response.

The `httpOnly` and `secure` options are `true` by default (except on http://localhost, where `secure` is `false`), and must be explicitly disabled if you want cookies to be readable by client-side JavaScript and/or transmitted over HTTP. The `sameSite` option defaults to `lax`.

You must specify a `path` for the cookie. In most cases you should explicitly set `path: '/'` to make the cookie available throughout your app. You can use relative paths, or set `path: ''` to make the cookie only available on the current path and its children

</div>
</div>
</div>

## Emulator

A collection of functions that influence the environment during dev, build and prerendering

<div class="ts-block">

```dts
interface Emulator {/*…*/}
```

<div class="ts-block-property">

```dts
platform?(details: { config: any; prerender: PrerenderOption }): MaybePromise<App.Platform>;
```

<div class="ts-block-property-details">

A function that is called with the current route `config` and `prerender` option
and returns an `App.Platform` object

</div>
</div>
</div>

## Handle

The [`handle`](https://kit.svelte.dev/docs/hooks#server-hooks-handle) hook runs every time the SvelteKit server receives a [request](https://kit.svelte.dev/docs/web-standards#fetch-apis-request) and
determines the [response](https://kit.svelte.dev/docs/web-standards#fetch-apis-response).
It receives an `event` object representing the request and a function called `resolve`, which renders the route and generates a `Response`.
This allows you to modify response headers or bodies, or bypass SvelteKit entirely (for implementing routes programmatically, for example).

<div class="ts-block">

```dts
type Handle = (input: {
	event: RequestEvent;
	resolve(
		event: RequestEvent,
		opts?: ResolveOptions
	): MaybePromise<Response>;
}) => MaybePromise<Response>;
```


</div>

## HandleClientError

The client-side [`handleError`](https://kit.svelte.dev/docs/hooks#shared-hooks-handleerror) hook runs when an unexpected error is thrown while navigating.

If an unexpected error is thrown during loading or the following render, this function will be called with the error and the event.
Make sure that this function _never_ throws an error.

<div class="ts-block">

```dts
type HandleClientError = (input: {
	error: unknown;
	event: NavigationEvent;
	status: number;
	message: string;
}) => MaybePromise<void | App.Error>;
```


</div>

## HandleFetch

The [`handleFetch`](https://kit.svelte.dev/docs/hooks#server-hooks-handlefetch) hook allows you to modify (or replace) a `fetch` request that happens inside a `load` function that runs on the server (or during pre-rendering)

<div class="ts-block">

```dts
type HandleFetch = (input: {
	event: RequestEvent;
	request: Request;
	fetch: typeof fetch;
}) => MaybePromise<Response>;
```


</div>

## HandleServerError

The server-side [`handleError`](https://kit.svelte.dev/docs/hooks#shared-hooks-handleerror) hook runs when an unexpected error is thrown while responding to a request.

If an unexpected error is thrown during loading or rendering, this function will be called with the error and the event.
Make sure that this function _never_ throws an error.

<div class="ts-block">

```dts
type HandleServerError = (input: {
	error: unknown;
	event: RequestEvent;
	status: number;
	message: string;
}) => MaybePromise<void | App.Error>;
```


</div>

## HttpError

The object returned by the [`error`](/docs/kit/reference/@sveltejs-kit#error) function.

<div class="ts-block">

```dts
interface HttpError {/*…*/}
```

<div class="ts-block-property">

```dts
status: number;
```

<div class="ts-block-property-details">

The [HTTP status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#client_error_responses), in the range 400-599.

</div>
</div>

<div class="ts-block-property">

```dts
body: App.Error;
```

<div class="ts-block-property-details">

The content of the error.

</div>
</div>
</div>

## KitConfig

See the [configuration reference](/docs/reference/configuration) for details.

## LessThan

<div class="ts-block">

```dts
type LessThan<
	TNumber extends number,
	TArray extends any[] = []
> = TNumber extends TArray['length']
	? TArray[number]
	: LessThan<TNumber, [...TArray, TArray['length']]>;
```


</div>

## Load

The generic form of `PageLoad` and `LayoutLoad`. You should import those from `./$types` (see [generated types](/docs/kit/reference/types#generated-types))
rather than using `Load` directly.

<div class="ts-block">

```dts
type Load<
	Params extends Partial<Record<string, string>> = Partial<
		Record<string, string>
	>,
	InputData extends Record<string, unknown> | null = Record<
		string,
		any
	> | null,
	ParentData extends Record<string, unknown> = Record<
		string,
		any
	>,
	OutputData extends Record<
		string,
		unknown
	> | void = Record<string, any> | void,
	RouteId extends string | null = string | null
> = (
	event: LoadEvent<Params, InputData, ParentData, RouteId>
) => MaybePromise<OutputData>;
```


</div>

## LoadEvent

The generic form of `PageLoadEvent` and `LayoutLoadEvent`. You should import those from `./$types` (see [generated types](/docs/kit/reference/types#generated-types))
rather than using `LoadEvent` directly.

<div class="ts-block">

```dts
interface LoadEvent<
	Params extends Partial<Record<string, string>> = Partial<
		Record<string, string>
	>,
	Data extends Record<string, unknown> | null = Record<
		string,
		any
	> | null,
	ParentData extends Record<string, unknown> = Record<
		string,
		any
	>,
	RouteId extends string | null = string | null
> extends NavigationEvent<Params, RouteId> {/*…*/}
```

<div class="ts-block-property">

```dts
fetch: typeof fetch;
```

<div class="ts-block-property-details">

`fetch` is equivalent to the [native `fetch` web API](https://developer.mozilla.org/en-US/docs/Web/API/fetch), with a few additional features:

- It can be used to make credentialed requests on the server, as it inherits the `cookie` and `authorization` headers for the page request.
- It can make relative requests on the server (ordinarily, `fetch` requires a URL with an origin when used in a server context).
- Internal requests (e.g. for `+server.js` routes) go directly to the handler function when running on the server, without the overhead of an HTTP call.
- During server-side rendering, the response will be captured and inlined into the rendered HTML by hooking into the `text` and `json` methods of the `Response` object. Note that headers will _not_ be serialized, unless explicitly included via [`filterSerializedResponseHeaders`](https://kit.svelte.dev/docs/hooks#server-hooks-handle)
- During hydration, the response will be read from the HTML, guaranteeing consistency and preventing an additional network request.

You can learn more about making credentialed requests with cookies [here](https://kit.svelte.dev/docs/load#cookies)

</div>
</div>

<div class="ts-block-property">

```dts
data: Data;
```

<div class="ts-block-property-details">

Contains the data returned by the route's server `load` function (in `+layout.server.js` or `+page.server.js`), if any.

</div>
</div>

<div class="ts-block-property">

```dts
setHeaders(headers: Record<string, string>): void;
```

<div class="ts-block-property-details">

If you need to set headers for the response, you can do so using the this method. This is useful if you want the page to be cached, for example:

```js
// @errors: 7031
/// file: src/routes/blog/+page.js
export async function load({ fetch, setHeaders }) {
	const url = `https://cms.example.com/articles.json`;
	const response = await fetch(url);

	setHeaders({
		age: response.headers.get('age'),
		'cache-control': response.headers.get('cache-control')
	});

	return response.json();
}
```

Setting the same header multiple times (even in separate `load` functions) is an error — you can only set a given header once.

You cannot add a `set-cookie` header with `setHeaders` — use the [`cookies`](/docs/kit/reference/types#public-types-cookies) API in a server-only `load` function instead.

`setHeaders` has no effect when a `load` function runs in the browser.

</div>
</div>

<div class="ts-block-property">

```dts
parent(): Promise<ParentData>;
```

<div class="ts-block-property-details">

`await parent()` returns data from parent `+layout.js` `load` functions.
Implicitly, a missing `+layout.js` is treated as a `({ data }) => data` function, meaning that it will return and forward data from parent `+layout.server.js` files.

Be careful not to introduce accidental waterfalls when using `await parent()`. If for example you only want to merge parent data into the returned output, call it _after_ fetching your other data.

</div>
</div>

<div class="ts-block-property">

```dts
depends(...deps: Array<`${string}:${string}`>): void;
```

<div class="ts-block-property-details">

This function declares that the `load` function has a _dependency_ on one or more URLs or custom identifiers, which can subsequently be used with [`invalidate()`](/docs/kit/reference/$app-navigation#invalidate) to cause `load` to rerun.

Most of the time you won't need this, as `fetch` calls `depends` on your behalf — it's only necessary if you're using a custom API client that bypasses `fetch`.

URLs can be absolute or relative to the page being loaded, and must be [encoded](https://developer.mozilla.org/en-US/docs/Glossary/percent-encoding).

Custom identifiers have to be prefixed with one or more lowercase letters followed by a colon to conform to the [URI specification](https://www.rfc-editor.org/rfc/rfc3986.html).

The following example shows how to use `depends` to register a dependency on a custom identifier, which is `invalidate`d after a button click, making the `load` function rerun.

```js
// @errors: 7031
/// file: src/routes/+page.js
let count = 0;
export async function load({ depends }) {
	depends('increase:count');

	return { count: count++ };
}
```

```html
/// file: src/routes/+page.svelte
<script>
	import { invalidate } from '$app/navigation';

	export let data;

	const increase = async () => {
		await invalidate('increase:count');
	}
</script>

<p>{data.count}<p>
<button on:click={increase}>Increase Count</button>
```

</div>
</div>

<div class="ts-block-property">

```dts
untrack<T>(fn: () => T): T;
```

<div class="ts-block-property-details">

Use this function to opt out of dependency tracking for everything that is synchronously called within the callback. Example:

```js
// @errors: 7031
/// file: src/routes/+page.server.js
export async function load({ untrack, url }) {
	// Untrack url.pathname so that path changes don't trigger a rerun
	if (untrack(() => url.pathname === '/')) {
		return { message: 'Welcome!' };
	}
}
```

</div>
</div>
</div>

## LoadProperties

<div class="ts-block">

```dts
type LoadProperties<
	input extends Record<string, any> | void
> = input extends void
	? undefined // needs to be undefined, because void will break intellisense
	: input extends Record<string, any>
		? input
		: unknown;
```


</div>

## Navigation

<div class="ts-block">

```dts
interface Navigation {/*…*/}
```

<div class="ts-block-property">

```dts
from: NavigationTarget | null;
```

<div class="ts-block-property-details">

Where navigation was triggered from

</div>
</div>

<div class="ts-block-property">

```dts
to: NavigationTarget | null;
```

<div class="ts-block-property-details">

Where navigation is going to/has gone to

</div>
</div>

<div class="ts-block-property">

```dts
type: Exclude<NavigationType, 'enter'>;
```

<div class="ts-block-property-details">

The type of navigation:
- `form`: The user submitted a `<form>`
- `leave`: The app is being left either because the tab is being closed or a navigation to a different document is occurring
- `link`: Navigation was triggered by a link click
- `goto`: Navigation was triggered by a `goto(...)` call or a redirect
- `popstate`: Navigation was triggered by back/forward navigation

</div>
</div>

<div class="ts-block-property">

```dts
willUnload: boolean;
```

<div class="ts-block-property-details">

Whether or not the navigation will result in the page being unloaded (i.e. not a client-side navigation)

</div>
</div>

<div class="ts-block-property">

```dts
delta?: number;
```

<div class="ts-block-property-details">

In case of a history back/forward navigation, the number of steps to go back/forward

</div>
</div>

<div class="ts-block-property">

```dts
complete: Promise<void>;
```

<div class="ts-block-property-details">

A promise that resolves once the navigation is complete, and rejects if the navigation
fails or is aborted. In the case of a `willUnload` navigation, the promise will never resolve

</div>
</div>
</div>

## NavigationEvent

<div class="ts-block">

```dts
interface NavigationEvent<
	Params extends Partial<Record<string, string>> = Partial<
		Record<string, string>
	>,
	RouteId extends string | null = string | null
> {/*…*/}
```

<div class="ts-block-property">

```dts
params: Params;
```

<div class="ts-block-property-details">

The parameters of the current page - e.g. for a route like `/blog/[slug]`, a `{ slug: string }` object

</div>
</div>

<div class="ts-block-property">

```dts
route: {/*…*/}
```

<div class="ts-block-property-details">

Info about the current route

<div class="ts-block-property-children"><div class="ts-block-property">

```dts
id: RouteId;
```

<div class="ts-block-property-details">

The ID of the current route - e.g. for `src/routes/blog/[slug]`, it would be `/blog/[slug]`

</div>
</div></div>

</div>
</div>

<div class="ts-block-property">

```dts
url: URL;
```

<div class="ts-block-property-details">

The URL of the current page

</div>
</div>
</div>

## NavigationTarget

Information about the target of a specific navigation.

<div class="ts-block">

```dts
interface NavigationTarget {/*…*/}
```

<div class="ts-block-property">

```dts
params: Record<string, string> | null;
```

<div class="ts-block-property-details">

Parameters of the target page - e.g. for a route like `/blog/[slug]`, a `{ slug: string }` object.
Is `null` if the target is not part of the SvelteKit app (could not be resolved to a route).

</div>
</div>

<div class="ts-block-property">

```dts
route: { id: string | null };
```

<div class="ts-block-property-details">

Info about the target route

</div>
</div>

<div class="ts-block-property">

```dts
url: URL;
```

<div class="ts-block-property-details">

The URL that is navigated to

</div>
</div>
</div>

## NavigationType

- `enter`: The app has hydrated
- `form`: The user submitted a `<form>` with a GET method
- `leave`: The user is leaving the app by closing the tab or using the back/forward buttons to go to a different document
- `link`: Navigation was triggered by a link click
- `goto`: Navigation was triggered by a `goto(...)` call or a redirect
- `popstate`: Navigation was triggered by back/forward navigation

<div class="ts-block">

```dts
type NavigationType =
	| 'enter'
	| 'form'
	| 'leave'
	| 'link'
	| 'goto'
	| 'popstate';
```


</div>

## NumericRange

<div class="ts-block">

```dts
type NumericRange<
	TStart extends number,
	TEnd extends number
> = Exclude<TEnd | LessThan<TEnd>, LessThan<TStart>>;
```


</div>

## OnNavigate

The argument passed to [`onNavigate`](/docs/kit/reference/$app-navigation#onnavigate) callbacks.

<div class="ts-block">

```dts
interface OnNavigate extends Navigation {/*…*/}
```

<div class="ts-block-property">

```dts
type: Exclude<NavigationType, 'enter' | 'leave'>;
```

<div class="ts-block-property-details">

The type of navigation:
- `form`: The user submitted a `<form>`
- `link`: Navigation was triggered by a link click
- `goto`: Navigation was triggered by a `goto(...)` call or a redirect
- `popstate`: Navigation was triggered by back/forward navigation

</div>
</div>

<div class="ts-block-property">

```dts
willUnload: false;
```

<div class="ts-block-property-details">

Since `onNavigate` callbacks are called immediately before a client-side navigation, they will never be called with a navigation that unloads the page.

</div>
</div>
</div>

## Page

The shape of the `$page` store

<div class="ts-block">

```dts
interface Page<
	Params extends Record<string, string> = Record<
		string,
		string
	>,
	RouteId extends string | null = string | null
> {/*…*/}
```

<div class="ts-block-property">

```dts
url: URL;
```

<div class="ts-block-property-details">

The URL of the current page

</div>
</div>

<div class="ts-block-property">

```dts
params: Params;
```

<div class="ts-block-property-details">

The parameters of the current page - e.g. for a route like `/blog/[slug]`, a `{ slug: string }` object

</div>
</div>

<div class="ts-block-property">

```dts
route: {/*…*/}
```

<div class="ts-block-property-details">

Info about the current route

<div class="ts-block-property-children"><div class="ts-block-property">

```dts
id: RouteId;
```

<div class="ts-block-property-details">

The ID of the current route - e.g. for `src/routes/blog/[slug]`, it would be `/blog/[slug]`

</div>
</div></div>

</div>
</div>

<div class="ts-block-property">

```dts
status: number;
```

<div class="ts-block-property-details">

Http status code of the current page

</div>
</div>

<div class="ts-block-property">

```dts
error: App.Error | null;
```

<div class="ts-block-property-details">

The error object of the current page, if any. Filled from the `handleError` hooks.

</div>
</div>

<div class="ts-block-property">

```dts
data: App.PageData & Record<string, any>;
```

<div class="ts-block-property-details">

The merged result of all data from all `load` functions on the current page. You can type a common denominator through `App.PageData`.

</div>
</div>

<div class="ts-block-property">

```dts
state: App.PageState;
```

<div class="ts-block-property-details">

The page state, which can be manipulated using the [`pushState`](/docs/kit/reference/$app-navigation#pushstate) and [`replaceState`](/docs/kit/reference/$app-navigation#replacestate) functions from `$app/navigation`.

</div>
</div>

<div class="ts-block-property">

```dts
form: any;
```

<div class="ts-block-property-details">

Filled only after a form submission. See [form actions](https://kit.svelte.dev/docs/form-actions) for more info.

</div>
</div>
</div>

## ParamMatcher

The shape of a param matcher. See [matching](https://kit.svelte.dev/docs/advanced-routing#matching) for more info.

<div class="ts-block">

```dts
type ParamMatcher = (param: string) => boolean;
```


</div>

## PrerenderOption

<div class="ts-block">

```dts
type PrerenderOption = boolean | 'auto';
```


</div>

## Redirect

The object returned by the [`redirect`](/docs/kit/reference/@sveltejs-kit#redirect) function

<div class="ts-block">

```dts
interface Redirect {/*…*/}
```

<div class="ts-block-property">

```dts
status: 300 | 301 | 302 | 303 | 304 | 305 | 306 | 307 | 308;
```

<div class="ts-block-property-details">

The [HTTP status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#redirection_messages), in the range 300-308.

</div>
</div>

<div class="ts-block-property">

```dts
location: string;
```

<div class="ts-block-property-details">

The location to redirect to.

</div>
</div>
</div>

## RequestEvent

<div class="ts-block">

```dts
interface RequestEvent<
	Params extends Partial<Record<string, string>> = Partial<
		Record<string, string>
	>,
	RouteId extends string | null = string | null
> {/*…*/}
```

<div class="ts-block-property">

```dts
cookies: Cookies;
```

<div class="ts-block-property-details">

Get or set cookies related to the current request

</div>
</div>

<div class="ts-block-property">

```dts
fetch: typeof fetch;
```

<div class="ts-block-property-details">

`fetch` is equivalent to the [native `fetch` web API](https://developer.mozilla.org/en-US/docs/Web/API/fetch), with a few additional features:

- It can be used to make credentialed requests on the server, as it inherits the `cookie` and `authorization` headers for the page request.
- It can make relative requests on the server (ordinarily, `fetch` requires a URL with an origin when used in a server context).
- Internal requests (e.g. for `+server.js` routes) go directly to the handler function when running on the server, without the overhead of an HTTP call.
- During server-side rendering, the response will be captured and inlined into the rendered HTML by hooking into the `text` and `json` methods of the `Response` object. Note that headers will _not_ be serialized, unless explicitly included via [`filterSerializedResponseHeaders`](https://kit.svelte.dev/docs/hooks#server-hooks-handle)
- During hydration, the response will be read from the HTML, guaranteeing consistency and preventing an additional network request.

You can learn more about making credentialed requests with cookies [here](https://kit.svelte.dev/docs/load#cookies)

</div>
</div>

<div class="ts-block-property">

```dts
getClientAddress(): string;
```

<div class="ts-block-property-details">

The client's IP address, set by the adapter.

</div>
</div>

<div class="ts-block-property">

```dts
locals: App.Locals;
```

<div class="ts-block-property-details">

Contains custom data that was added to the request within the [`handle hook`](https://kit.svelte.dev/docs/hooks#server-hooks-handle).

</div>
</div>

<div class="ts-block-property">

```dts
params: Params;
```

<div class="ts-block-property-details">

The parameters of the current route - e.g. for a route like `/blog/[slug]`, a `{ slug: string }` object

</div>
</div>

<div class="ts-block-property">

```dts
platform: Readonly<App.Platform> | undefined;
```

<div class="ts-block-property-details">

Additional data made available through the adapter.

</div>
</div>

<div class="ts-block-property">

```dts
request: Request;
```

<div class="ts-block-property-details">

The original request object

</div>
</div>

<div class="ts-block-property">

```dts
route: {/*…*/}
```

<div class="ts-block-property-details">

Info about the current route

<div class="ts-block-property-children"><div class="ts-block-property">

```dts
id: RouteId;
```

<div class="ts-block-property-details">

The ID of the current route - e.g. for `src/routes/blog/[slug]`, it would be `/blog/[slug]`

</div>
</div></div>

</div>
</div>

<div class="ts-block-property">

```dts
setHeaders(headers: Record<string, string>): void;
```

<div class="ts-block-property-details">

If you need to set headers for the response, you can do so using the this method. This is useful if you want the page to be cached, for example:

```js
// @errors: 7031
/// file: src/routes/blog/+page.js
export async function load({ fetch, setHeaders }) {
	const url = `https://cms.example.com/articles.json`;
	const response = await fetch(url);

	setHeaders({
		age: response.headers.get('age'),
		'cache-control': response.headers.get('cache-control')
	});

	return response.json();
}
```

Setting the same header multiple times (even in separate `load` functions) is an error — you can only set a given header once.

You cannot add a `set-cookie` header with `setHeaders` — use the [`cookies`](/docs/kit/reference/types#public-types-cookies) API instead.

</div>
</div>

<div class="ts-block-property">

```dts
url: URL;
```

<div class="ts-block-property-details">

The requested URL.

</div>
</div>

<div class="ts-block-property">

```dts
isDataRequest: boolean;
```

<div class="ts-block-property-details">

`true` if the request comes from the client asking for `+page/layout.server.js` data. The `url` property will be stripped of the internal information
related to the data request in this case. Use this property instead if the distinction is important to you.

</div>
</div>

<div class="ts-block-property">

```dts
isSubRequest: boolean;
```

<div class="ts-block-property-details">

`true` for `+server.js` calls coming from SvelteKit without the overhead of actually making an HTTP request. This happens when you make same-origin `fetch` requests on the server.

</div>
</div>
</div>

## RequestHandler

A `(event: RequestEvent) => Response` function exported from a `+server.js` file that corresponds to an HTTP verb (`GET`, `PUT`, `PATCH`, etc) and handles requests with that method.

It receives `Params` as the first generic argument, which you can skip by using [generated types](/docs/kit/reference/types#generated-types) instead.

<div class="ts-block">

```dts
type RequestHandler<
	Params extends Partial<Record<string, string>> = Partial<
		Record<string, string>
	>,
	RouteId extends string | null = string | null
> = (
	event: RequestEvent<Params, RouteId>
) => MaybePromise<Response>;
```


</div>

## Reroute

The [`reroute`](https://kit.svelte.dev/docs/hooks#universal-hooks-reroute) hook allows you to modify the URL before it is used to determine which route to render.

<div class="ts-block">

```dts
type Reroute = (event: { url: URL }) => void | string;
```


</div>

## ResolveOptions

<div class="ts-block">

```dts
interface ResolveOptions {/*…*/}
```

<div class="ts-block-property">

```dts
transformPageChunk?(input: { html: string; done: boolean }): MaybePromise<string | undefined>;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- `input` the html chunk and the info if this is the last chunk

</div>

Applies custom transforms to HTML. If `done` is true, it's the final chunk. Chunks are not guaranteed to be well-formed HTML
(they could include an element's opening tag but not its closing tag, for example)
but they will always be split at sensible boundaries such as `%sveltekit.head%` or layout/page components.

</div>
</div>

<div class="ts-block-property">

```dts
filterSerializedResponseHeaders?(name: string, value: string): boolean;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- `name` header name
- `value` header value

</div>

Determines which headers should be included in serialized responses when a `load` function loads a resource with `fetch`.
By default, none will be included.

</div>
</div>

<div class="ts-block-property">

```dts
preload?(input: { type: 'font' | 'css' | 'js' | 'asset'; path: string }): boolean;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- `input` the type of the file and its path

</div>

Determines what should be added to the `<head>` tag to preload it.
By default, `js` and `css` files will be preloaded.

</div>
</div>
</div>

## RouteDefinition

<div class="ts-block">

```dts
interface RouteDefinition<Config = any> {/*…*/}
```

<div class="ts-block-property">

```dts
id: string;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
api: {
	methods: Array<HttpMethod | '*'>;
};
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
page: {
	methods: Array<Extract<HttpMethod, 'GET' | 'POST'>>;
};
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
pattern: RegExp;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
prerender: PrerenderOption;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
segments: RouteSegment[];
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
methods: Array<HttpMethod | '*'>;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
config: Config;
```

<div class="ts-block-property-details"></div>
</div>
</div>

## SSRManifest

<div class="ts-block">

```dts
interface SSRManifest {/*…*/}
```

<div class="ts-block-property">

```dts
appDir: string;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
appPath: string;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
assets: Set<string>;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
mimeTypes: Record<string, string>;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
_: {/*…*/}
```

<div class="ts-block-property-details">

private fields

<div class="ts-block-property-children"><div class="ts-block-property">

```dts
client: NonNullable<BuildData['client']>;
```

<div class="ts-block-property-details"></div>
</div>
<div class="ts-block-property">

```dts
nodes: SSRNodeLoader[];
```

<div class="ts-block-property-details"></div>
</div>
<div class="ts-block-property">

```dts
routes: SSRRoute[];
```

<div class="ts-block-property-details"></div>
</div>
<div class="ts-block-property">

```dts
matchers(): Promise<Record<string, ParamMatcher>>;
```

<div class="ts-block-property-details"></div>
</div>
<div class="ts-block-property">

```dts
server_assets: Record<string, number>;
```

<div class="ts-block-property-details">

A `[file]: size` map of all assets imported by server code

</div>
</div></div>

</div>
</div>
</div>

## Server

<div class="ts-block">

```dts
class Server {/*…*/}
```

<div class="ts-block-property">

```dts
constructor(manifest: SSRManifest);
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
init(options: ServerInitOptions): Promise<void>;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
respond(request: Request, options: RequestOptions): Promise<Response>;
```

<div class="ts-block-property-details"></div>
</div>
</div>

## ServerInitOptions

<div class="ts-block">

```dts
interface ServerInitOptions {/*…*/}
```

<div class="ts-block-property">

```dts
env: Record<string, string>;
```

<div class="ts-block-property-details">

A map of environment variables

</div>
</div>

<div class="ts-block-property">

```dts
read?: (file: string) => ReadableStream;
```

<div class="ts-block-property-details">

A function that turns an asset filename into a `ReadableStream`. Required for the `read` export from `$app/server` to work

</div>
</div>
</div>

## ServerLoad

The generic form of `PageServerLoad` and `LayoutServerLoad`. You should import those from `./$types` (see [generated types](/docs/kit/reference/types#generated-types))
rather than using `ServerLoad` directly.

<div class="ts-block">

```dts
type ServerLoad<
	Params extends Partial<Record<string, string>> = Partial<
		Record<string, string>
	>,
	ParentData extends Record<string, any> = Record<
		string,
		any
	>,
	OutputData extends Record<string, any> | void = Record<
		string,
		any
	> | void,
	RouteId extends string | null = string | null
> = (
	event: ServerLoadEvent<Params, ParentData, RouteId>
) => MaybePromise<OutputData>;
```


</div>

## ServerLoadEvent

<div class="ts-block">

```dts
interface ServerLoadEvent<
	Params extends Partial<Record<string, string>> = Partial<
		Record<string, string>
	>,
	ParentData extends Record<string, any> = Record<
		string,
		any
	>,
	RouteId extends string | null = string | null
> extends RequestEvent<Params, RouteId> {/*…*/}
```

<div class="ts-block-property">

```dts
parent(): Promise<ParentData>;
```

<div class="ts-block-property-details">

`await parent()` returns data from parent `+layout.server.js` `load` functions.

Be careful not to introduce accidental waterfalls when using `await parent()`. If for example you only want to merge parent data into the returned output, call it _after_ fetching your other data.

</div>
</div>

<div class="ts-block-property">

```dts
depends(...deps: string[]): void;
```

<div class="ts-block-property-details">

This function declares that the `load` function has a _dependency_ on one or more URLs or custom identifiers, which can subsequently be used with [`invalidate()`](/docs/kit/reference/$app-navigation#invalidate) to cause `load` to rerun.

Most of the time you won't need this, as `fetch` calls `depends` on your behalf — it's only necessary if you're using a custom API client that bypasses `fetch`.

URLs can be absolute or relative to the page being loaded, and must be [encoded](https://developer.mozilla.org/en-US/docs/Glossary/percent-encoding).

Custom identifiers have to be prefixed with one or more lowercase letters followed by a colon to conform to the [URI specification](https://www.rfc-editor.org/rfc/rfc3986.html).

The following example shows how to use `depends` to register a dependency on a custom identifier, which is `invalidate`d after a button click, making the `load` function rerun.

```js
// @errors: 7031
/// file: src/routes/+page.js
let count = 0;
export async function load({ depends }) {
	depends('increase:count');

	return { count: count++ };
}
```

```html
/// file: src/routes/+page.svelte
<script>
	import { invalidate } from '$app/navigation';

	export let data;

	const increase = async () => {
		await invalidate('increase:count');
	}
</script>

<p>{data.count}<p>
<button on:click={increase}>Increase Count</button>
```

</div>
</div>

<div class="ts-block-property">

```dts
untrack<T>(fn: () => T): T;
```

<div class="ts-block-property-details">

Use this function to opt out of dependency tracking for everything that is synchronously called within the callback. Example:

```js
// @errors: 7031
/// file: src/routes/+page.js
export async function load({ untrack, url }) {
	// Untrack url.pathname so that path changes don't trigger a rerun
	if (untrack(() => url.pathname === '/')) {
		return { message: 'Welcome!' };
	}
}
```

</div>
</div>
</div>

## Snapshot

The type of `export const snapshot` exported from a page or layout component.

<div class="ts-block">

```dts
interface Snapshot<T = any> {/*…*/}
```

<div class="ts-block-property">

```dts
capture: () => T;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
restore: (snapshot: T) => void;
```

<div class="ts-block-property-details"></div>
</div>
</div>

## SubmitFunction

<div class="ts-block">

```dts
type SubmitFunction<
	Success extends
		| Record<string, unknown>
		| undefined = Record<string, any>,
	Failure extends
		| Record<string, unknown>
		| undefined = Record<string, any>
> = (input: {
	action: URL;
	formData: FormData;
	formElement: HTMLFormElement;
	controller: AbortController;
	submitter: HTMLElement | null;
	cancel(): void;
}) => MaybePromise<
	| void
	| ((opts: {
			formData: FormData;
			formElement: HTMLFormElement;
			action: URL;
			result: ActionResult<Success, Failure>;
			/**
			 * Call this to get the default behavior of a form submission response.
			 * @param options Set `reset: false` if you don't want the `<form>` values to be reset after a successful submission.
			 * @param invalidateAll Set `invalidateAll: false` if you don't want the action to call `invalidateAll` after submission.
			 */
			update(options?: {
				reset?: boolean;
				invalidateAll?: boolean;
			}): Promise<void>;
	  }) => void)
>;
```


</div>


<!-- @include_end @sveltejs/kit -->

<!-- @include_start @sveltejs/kit/hooks -->


```js
// @noErrors
import { sequence } from '@sveltejs/kit/hooks';
```

## sequence

A helper function for sequencing multiple `handle` calls in a middleware-like manner.
The behavior for the `handle` options is as follows:
- `transformPageChunk` is applied in reverse order and merged
- `preload` is applied in forward order, the first option "wins" and no `preload` options after it are called
- `filterSerializedResponseHeaders` behaves the same as `preload`

```js
// @errors: 7031
/// file: src/hooks.server.js
import { sequence } from '@sveltejs/kit/hooks';

/// type: import('@sveltejs/kit').Handle
async function first({ event, resolve }) {
	console.log('first pre-processing');
	const result = await resolve(event, {
		transformPageChunk: ({ html }) => {
			// transforms are applied in reverse order
			console.log('first transform');
			return html;
		},
		preload: () => {
			// this one wins as it's the first defined in the chain
			console.log('first preload');
		}
	});
	console.log('first post-processing');
	return result;
}

/// type: import('@sveltejs/kit').Handle
async function second({ event, resolve }) {
	console.log('second pre-processing');
	const result = await resolve(event, {
		transformPageChunk: ({ html }) => {
			console.log('second transform');
			return html;
		},
		preload: () => {
			console.log('second preload');
		},
		filterSerializedResponseHeaders: () => {
			// this one wins as it's the first defined in the chain
   		console.log('second filterSerializedResponseHeaders');
		}
	});
	console.log('second post-processing');
	return result;
}

export const handle = sequence(first, second);
```

The example above would print:

```
first pre-processing
first preload
second pre-processing
second filterSerializedResponseHeaders
second transform
first transform
second post-processing
first post-processing
```

<div class="ts-block">

```ts
// @noErrors
function sequence(
	...handlers: import('@sveltejs/kit').Handle[]
): import('@sveltejs/kit').Handle;
```

</div>


<!-- @include_end @sveltejs/kit/hooks -->

<!-- @include_start @sveltejs/kit/node -->


```js
// @noErrors
import {
	createReadableStream,
	getRequest,
	setResponse
} from '@sveltejs/kit/node';
```

## createReadableStream

Converts a file on disk to a readable stream

<div class="ts-block">

```ts
// @noErrors
function createReadableStream(file: string): ReadableStream;
```

</div>

## getRequest



<div class="ts-block">

```ts
// @noErrors
function getRequest({
	request,
	base,
	bodySizeLimit
}: {
	request: import('http').IncomingMessage;
	base: string;
	bodySizeLimit?: number;
}): Promise<Request>;
```

</div>

## setResponse



<div class="ts-block">

```ts
// @noErrors
function setResponse(
	res: import('http').ServerResponse,
	response: Response
): Promise<void>;
```

</div>


<!-- @include_end @sveltejs/kit/node -->

<!-- @include_start @sveltejs/kit/node/polyfills -->


```js
// @noErrors
import { installPolyfills } from '@sveltejs/kit/node/polyfills';
```

## installPolyfills

Make various web APIs available as globals:
- `crypto`
- `File`

<div class="ts-block">

```ts
// @noErrors
function installPolyfills(): void;
```

</div>


<!-- @include_end @sveltejs/kit/node/polyfills -->

<!-- @include_start @sveltejs/kit/vite -->


```js
// @noErrors
import { sveltekit } from '@sveltejs/kit/vite';
```

## sveltekit

Returns the SvelteKit Vite plugins.

<div class="ts-block">

```ts
// @noErrors
function sveltekit(): Promise<import('vite').Plugin[]>;
```

</div>


<!-- @include_end @sveltejs/kit/vite -->

<!-- @include_start App -->
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


<!-- @include_end App -->

<!-- @include_start Private types -->
## AdapterEntry

<div class="ts-block">

```dts
interface AdapterEntry {/*…*/}
```

<div class="ts-block-property">

```dts
id: string;
```

<div class="ts-block-property-details">

A string that uniquely identifies an HTTP service (e.g. serverless function) and is used for deduplication.
For example, `/foo/a-[b]` and `/foo/[c]` are different routes, but would both
be represented in a Netlify _redirects file as `/foo/:param`, so they share an ID

</div>
</div>

<div class="ts-block-property">

```dts
filter(route: RouteDefinition): boolean;
```

<div class="ts-block-property-details">

A function that compares the candidate route with the current route to determine
if it should be grouped with the current route.

Use cases:
- Fallback pages: `/foo/[c]` is a fallback for `/foo/a-[b]`, and `/[...catchall]` is a fallback for all routes
- Grouping routes that share a common `config`: `/foo` should be deployed to the edge, `/bar` and `/baz` should be deployed to a serverless function

</div>
</div>

<div class="ts-block-property">

```dts
complete(entry: { generateManifest(opts: { relativePath: string }): string }): MaybePromise<void>;
```

<div class="ts-block-property-details">

A function that is invoked once the entry has been created. This is where you
should write the function to the filesystem and generate redirect manifests.

</div>
</div>
</div>

## Csp

<div class="ts-block">

```dts
namespace Csp {
	type ActionSource = 'strict-dynamic' | 'report-sample';
	type BaseSource =
		| 'self'
		| 'unsafe-eval'
		| 'unsafe-hashes'
		| 'unsafe-inline'
		| 'wasm-unsafe-eval'
		| 'none';
	type CryptoSource =
		`${'nonce' | 'sha256' | 'sha384' | 'sha512'}-${string}`;
	type FrameSource =
		| HostSource
		| SchemeSource
		| 'self'
		| 'none';
	type HostNameScheme = `${string}.${string}` | 'localhost';
	type HostSource =
		`${HostProtocolSchemes}${HostNameScheme}${PortScheme}`;
	type HostProtocolSchemes = `${string}://` | '';
	type HttpDelineator = '/' | '?' | '#' | '\\';
	type PortScheme = `:${number}` | '' | ':*';
	type SchemeSource =
		| 'http:'
		| 'https:'
		| 'data:'
		| 'mediastream:'
		| 'blob:'
		| 'filesystem:';
	type Source =
		| HostSource
		| SchemeSource
		| CryptoSource
		| BaseSource;
	type Sources = Source[];
}
```


</div>

## CspDirectives

<div class="ts-block">

```dts
interface CspDirectives {/*…*/}
```

<div class="ts-block-property">

```dts
'child-src'?: Csp.Sources;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
'default-src'?: Array<Csp.Source | Csp.ActionSource>;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
'frame-src'?: Csp.Sources;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
'worker-src'?: Csp.Sources;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
'connect-src'?: Csp.Sources;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
'font-src'?: Csp.Sources;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
'img-src'?: Csp.Sources;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
'manifest-src'?: Csp.Sources;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
'media-src'?: Csp.Sources;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
'object-src'?: Csp.Sources;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
'prefetch-src'?: Csp.Sources;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
'script-src'?: Array<Csp.Source | Csp.ActionSource>;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
'script-src-elem'?: Csp.Sources;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
'script-src-attr'?: Csp.Sources;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
'style-src'?: Array<Csp.Source | Csp.ActionSource>;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
'style-src-elem'?: Csp.Sources;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
'style-src-attr'?: Csp.Sources;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
'base-uri'?: Array<Csp.Source | Csp.ActionSource>;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
sandbox?: Array<
| 'allow-downloads-without-user-activation'
| 'allow-forms'
| 'allow-modals'
| 'allow-orientation-lock'
| 'allow-pointer-lock'
| 'allow-popups'
| 'allow-popups-to-escape-sandbox'
| 'allow-presentation'
| 'allow-same-origin'
| 'allow-scripts'
| 'allow-storage-access-by-user-activation'
| 'allow-top-navigation'
| 'allow-top-navigation-by-user-activation'
>;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
'form-action'?: Array<Csp.Source | Csp.ActionSource>;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
'frame-ancestors'?: Array<Csp.HostSource | Csp.SchemeSource | Csp.FrameSource>;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
'navigate-to'?: Array<Csp.Source | Csp.ActionSource>;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
'report-uri'?: string[];
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
'report-to'?: string[];
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
'require-trusted-types-for'?: Array<'script'>;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
'trusted-types'?: Array<'none' | 'allow-duplicates' | '*' | string>;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
'upgrade-insecure-requests'?: boolean;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
'require-sri-for'?: Array<'script' | 'style' | 'script style'>;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag deprecated">deprecated</span> 

</div>

</div>
</div>

<div class="ts-block-property">

```dts
'block-all-mixed-content'?: boolean;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag deprecated">deprecated</span> 

</div>

</div>
</div>

<div class="ts-block-property">

```dts
'plugin-types'?: Array<`${string}/${string}` | 'none'>;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag deprecated">deprecated</span> 

</div>

</div>
</div>

<div class="ts-block-property">

```dts
referrer?: Array<
| 'no-referrer'
| 'no-referrer-when-downgrade'
| 'origin'
| 'origin-when-cross-origin'
| 'same-origin'
| 'strict-origin'
| 'strict-origin-when-cross-origin'
| 'unsafe-url'
| 'none'
>;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag deprecated">deprecated</span> 

</div>

</div>
</div>
</div>

## HttpMethod

<div class="ts-block">

```dts
type HttpMethod =
	| 'GET'
	| 'HEAD'
	| 'POST'
	| 'PUT'
	| 'DELETE'
	| 'PATCH'
	| 'OPTIONS';
```


</div>

## Logger

<div class="ts-block">

```dts
interface Logger {/*…*/}
```

<div class="ts-block-property">

```dts
(msg: string): void;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
success(msg: string): void;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
error(msg: string): void;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
warn(msg: string): void;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
minor(msg: string): void;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
info(msg: string): void;
```

<div class="ts-block-property-details"></div>
</div>
</div>

## MaybePromise

<div class="ts-block">

```dts
type MaybePromise<T> = T | Promise<T>;
```


</div>

## PrerenderEntryGeneratorMismatchHandler

<div class="ts-block">

```dts
interface PrerenderEntryGeneratorMismatchHandler {/*…*/}
```

<div class="ts-block-property">

```dts
(details: { generatedFromId: string; entry: string; matchedId: string; message: string }): void;
```

<div class="ts-block-property-details"></div>
</div>
</div>

## PrerenderEntryGeneratorMismatchHandlerValue

<div class="ts-block">

```dts
type PrerenderEntryGeneratorMismatchHandlerValue =
	| 'fail'
	| 'warn'
	| 'ignore'
	| PrerenderEntryGeneratorMismatchHandler;
```


</div>

## PrerenderHttpErrorHandler

<div class="ts-block">

```dts
interface PrerenderHttpErrorHandler {/*…*/}
```

<div class="ts-block-property">

```dts
(details: {
status: number;
path: string;
referrer: string | null;
referenceType: 'linked' | 'fetched';
message: string;
}): void;
```

<div class="ts-block-property-details"></div>
</div>
</div>

## PrerenderHttpErrorHandlerValue

<div class="ts-block">

```dts
type PrerenderHttpErrorHandlerValue =
	| 'fail'
	| 'warn'
	| 'ignore'
	| PrerenderHttpErrorHandler;
```


</div>

## PrerenderMap

<div class="ts-block">

```dts
type PrerenderMap = Map<string, PrerenderOption>;
```


</div>

## PrerenderMissingIdHandler

<div class="ts-block">

```dts
interface PrerenderMissingIdHandler {/*…*/}
```

<div class="ts-block-property">

```dts
(details: { path: string; id: string; referrers: string[]; message: string }): void;
```

<div class="ts-block-property-details"></div>
</div>
</div>

## PrerenderMissingIdHandlerValue

<div class="ts-block">

```dts
type PrerenderMissingIdHandlerValue =
	| 'fail'
	| 'warn'
	| 'ignore'
	| PrerenderMissingIdHandler;
```


</div>

## PrerenderOption

<div class="ts-block">

```dts
type PrerenderOption = boolean | 'auto';
```


</div>

## Prerendered

<div class="ts-block">

```dts
interface Prerendered {/*…*/}
```

<div class="ts-block-property">

```dts
pages: Map<
string,
{
	/** The location of the .html file relative to the output directory */
	file: string;
}
>;
```

<div class="ts-block-property-details">

A map of `path` to `{ file }` objects, where a path like `/foo` corresponds to `foo.html` and a path like `/bar/` corresponds to `bar/index.html`.

</div>
</div>

<div class="ts-block-property">

```dts
assets: Map<
string,
{
	/** The MIME type of the asset */
	type: string;
}
>;
```

<div class="ts-block-property-details">

A map of `path` to `{ type }` objects.

</div>
</div>

<div class="ts-block-property">

```dts
redirects: Map<
string,
{
	status: number;
	location: string;
}
>;
```

<div class="ts-block-property-details">

A map of redirects encountered during prerendering.

</div>
</div>

<div class="ts-block-property">

```dts
paths: string[];
```

<div class="ts-block-property-details">

An array of prerendered paths (without trailing slashes, regardless of the trailingSlash config)

</div>
</div>
</div>

## RequestOptions

<div class="ts-block">

```dts
interface RequestOptions {/*…*/}
```

<div class="ts-block-property">

```dts
getClientAddress(): string;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
platform?: App.Platform;
```

<div class="ts-block-property-details"></div>
</div>
</div>

## RouteSegment

<div class="ts-block">

```dts
interface RouteSegment {/*…*/}
```

<div class="ts-block-property">

```dts
content: string;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
dynamic: boolean;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
rest: boolean;
```

<div class="ts-block-property-details"></div>
</div>
</div>

## TrailingSlash

<div class="ts-block">

```dts
type TrailingSlash = 'never' | 'always' | 'ignore';
```


</div>


<!-- @include_end Private types -->

<!-- @include_start KitConfig -->
## adapter

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `undefined`

</div>

Your [adapter](https://kit.svelte.dev/docs/adapters) is run when executing `vite build`. It determines how the output is converted for different platforms.

<div class="ts-block-property-children">



</div>

## alias

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `{}`

</div>

An object containing zero or more aliases used to replace values in `import` statements. These aliases are automatically passed to Vite and TypeScript.

```js
// @errors: 7031
/// file: svelte.config.js
/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		alias: {
			// this will match a file
			'my-file': 'path/to/my-file.js',

			// this will match a directory and its contents
			// (`my-directory/x` resolves to `path/to/my-directory/x`)
			'my-directory': 'path/to/my-directory',

			// an alias ending /* will only match
			// the contents of a directory, not the directory itself
			'my-directory/*': 'path/to/my-directory/*'
		}
	}
};
```

> The built-in `$lib` alias is controlled by `config.kit.files.lib` as it is used for packaging.

> You will need to run `npm run dev` to have SvelteKit automatically generate the required alias configuration in `jsconfig.json` or `tsconfig.json`.

<div class="ts-block-property-children">



</div>

## appDir

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `"_app"`

</div>

The directory where SvelteKit keeps its stuff, including static assets (such as JS and CSS) and internally-used routes.

If `paths.assets` is specified, there will be two app directories — `${paths.assets}/${appDir}` and `${paths.base}/${appDir}`.

<div class="ts-block-property-children">



</div>

## csp

<div class="ts-block-property-bullets">



</div>

[Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy) configuration. CSP helps to protect your users against cross-site scripting (XSS) attacks, by limiting the places resources can be loaded from. For example, a configuration like this...

```js
// @errors: 7031
/// file: svelte.config.js
/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		csp: {
			directives: {
				'script-src': ['self']
			},
			reportOnly: {
				'script-src': ['self']
			}
		}
	}
};

export default config;
```

...would prevent scripts loading from external sites. SvelteKit will augment the specified directives with nonces or hashes (depending on `mode`) for any inline styles and scripts it generates.

To add a nonce for scripts and links manually included in `src/app.html`, you may use the placeholder `%sveltekit.nonce%` (for example `<script nonce="%sveltekit.nonce%">`).

When pages are prerendered, the CSP header is added via a `<meta http-equiv>` tag (note that in this case, `frame-ancestors`, `report-uri` and `sandbox` directives will be ignored).

> When `mode` is `'auto'`, SvelteKit will use nonces for dynamically rendered pages and hashes for prerendered pages. Using nonces with prerendered pages is insecure and therefore forbidden.

> Note that most [Svelte transitions](https://svelte.dev/tutorial/transition) work by creating an inline `<style>` element. If you use these in your app, you must either leave the `style-src` directive unspecified or add `unsafe-inline`.

If this level of configuration is insufficient and you have more dynamic requirements, you can use the [`handle` hook](https://kit.svelte.dev/docs/hooks#server-hooks-handle) to roll your own CSP.

<div class="ts-block-property-children">

<div class="ts-block-property">

```ts
// @noErrors
mode?: 'hash' | 'nonce' | 'auto';
```

<div class="ts-block-property-details">

Whether to use hashes or nonces to restrict `<script>` and `<style>` elements. `'auto'` will use hashes for prerendered pages, and nonces for dynamically rendered pages.

</div>
</div>
<div class="ts-block-property">

```ts
// @noErrors
directives?: CspDirectives;
```

<div class="ts-block-property-details">

Directives that will be added to `Content-Security-Policy` headers.

</div>
</div>
<div class="ts-block-property">

```ts
// @noErrors
reportOnly?: CspDirectives;
```

<div class="ts-block-property-details">

Directives that will be added to `Content-Security-Policy-Report-Only` headers.

</div>
</div>

</div>

## csrf

<div class="ts-block-property-bullets">



</div>

Protection against [cross-site request forgery (CSRF)](https://owasp.org/www-community/attacks/csrf) attacks.

<div class="ts-block-property-children">

<div class="ts-block-property">

```ts
// @noErrors
checkOrigin?: boolean;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `true`

</div>

Whether to check the incoming `origin` header for `POST`, `PUT`, `PATCH`, or `DELETE` form submissions and verify that it matches the server's origin.

To allow people to make `POST`, `PUT`, `PATCH`, or `DELETE` requests with a `Content-Type` of `application/x-www-form-urlencoded`, `multipart/form-data`, or `text/plain` to your app from other origins, you will need to disable this option. Be careful!

</div>
</div>

</div>

## embedded

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `false`

</div>

Whether or not the app is embedded inside a larger app. If `true`, SvelteKit will add its event listeners related to navigation etc on the parent of `%sveltekit.body%` instead of `window`, and will pass `params` from the server rather than inferring them from `location.pathname`.
Note that it is generally not supported to embed multiple SvelteKit apps on the same page and use client-side SvelteKit features within them (things such as pushing to the history state assume a single instance).

<div class="ts-block-property-children">



</div>

## env

<div class="ts-block-property-bullets">



</div>

Environment variable configuration

<div class="ts-block-property-children">

<div class="ts-block-property">

```ts
// @noErrors
dir?: string;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `"."`

</div>

The directory to search for `.env` files.

</div>
</div>
<div class="ts-block-property">

```ts
// @noErrors
publicPrefix?: string;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `"PUBLIC_"`

</div>

A prefix that signals that an environment variable is safe to expose to client-side code. See [`$env/static/public`](/docs/kit/reference/$env-all#$env-static-public) and [`$env/dynamic/public`](/docs/kit/reference/$env-all#$env-dynamic-public). Note that Vite's [`envPrefix`](https://vitejs.dev/config/shared-options.html#envprefix) must be set separately if you are using Vite's environment variable handling - though use of that feature should generally be unnecessary.

</div>
</div>
<div class="ts-block-property">

```ts
// @noErrors
privatePrefix?: string;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `""`

</div>

A prefix that signals that an environment variable is unsafe to expose to client-side code. Environment variables matching neither the public nor the private prefix will be discarded completely. See [`$env/static/private`](/docs/kit/reference/$env-all#$env-static-private) and [`$env/dynamic/private`](/docs/kit/reference/$env-all#$env-dynamic-private).

</div>
</div>

</div>

## files

<div class="ts-block-property-bullets">



</div>

Where to find various files within your project.

<div class="ts-block-property-children">

<div class="ts-block-property">

```ts
// @noErrors
assets?: string;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `"static"`

</div>

a place to put static files that should have stable URLs and undergo no processing, such as `favicon.ico` or `manifest.json`

</div>
</div>
<div class="ts-block-property">

```ts
// @noErrors
hooks?: {/*…*/}
```

<div class="ts-block-property-details">

<div class="ts-block-property-children"><div class="ts-block-property">

```ts
// @noErrors
client?: string;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `"src/hooks.client"`

</div>

The location of your client [hooks](https://kit.svelte.dev/docs/hooks).

</div>
</div>
<div class="ts-block-property">

```ts
// @noErrors
server?: string;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `"src/hooks.server"`

</div>

The location of your server [hooks](https://kit.svelte.dev/docs/hooks).

</div>
</div>
<div class="ts-block-property">

```ts
// @noErrors
universal?: string;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `"src/hooks"`

</div>

The location of your universal [hooks](https://kit.svelte.dev/docs/hooks).

</div>
</div></div>

</div>
</div>
<div class="ts-block-property">

```ts
// @noErrors
lib?: string;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `"src/lib"`

</div>

your app's internal library, accessible throughout the codebase as `$lib`

</div>
</div>
<div class="ts-block-property">

```ts
// @noErrors
params?: string;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `"src/params"`

</div>

a directory containing [parameter matchers](https://kit.svelte.dev/docs/advanced-routing#matching)

</div>
</div>
<div class="ts-block-property">

```ts
// @noErrors
routes?: string;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `"src/routes"`

</div>

the files that define the structure of your app (see [Routing](https://kit.svelte.dev/docs/routing))

</div>
</div>
<div class="ts-block-property">

```ts
// @noErrors
serviceWorker?: string;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `"src/service-worker"`

</div>

the location of your service worker's entry point (see [Service workers](https://kit.svelte.dev/docs/service-workers))

</div>
</div>
<div class="ts-block-property">

```ts
// @noErrors
appTemplate?: string;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `"src/app.html"`

</div>

the location of the template for HTML responses

</div>
</div>
<div class="ts-block-property">

```ts
// @noErrors
errorTemplate?: string;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `"src/error.html"`

</div>

the location of the template for fallback error responses

</div>
</div>

</div>

## inlineStyleThreshold

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `0`

</div>

Inline CSS inside a `<style>` block at the head of the HTML. This option is a number that specifies the maximum length of a CSS file in UTF-16 code units, as specified by the [String.length](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/length) property, to be inlined. All CSS files needed for the page and smaller than this value are merged and inlined in a `<style>` block.

> This results in fewer initial requests and can improve your [First Contentful Paint](https://web.dev/first-contentful-paint) score. However, it generates larger HTML output and reduces the effectiveness of browser caches. Use it advisedly.

<div class="ts-block-property-children">



</div>

## moduleExtensions

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `[".js", ".ts"]`

</div>

An array of file extensions that SvelteKit will treat as modules. Files with extensions that match neither `config.extensions` nor `config.kit.moduleExtensions` will be ignored by the router.

<div class="ts-block-property-children">



</div>

## outDir

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `".svelte-kit"`

</div>

The directory that SvelteKit writes files to during `dev` and `build`. You should exclude this directory from version control.

<div class="ts-block-property-children">



</div>

## output

<div class="ts-block-property-bullets">



</div>

Options related to the build output format

<div class="ts-block-property-children">

<div class="ts-block-property">

```ts
// @noErrors
preloadStrategy?: 'modulepreload' | 'preload-js' | 'preload-mjs';
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `"modulepreload"`

</div>

SvelteKit will preload the JavaScript modules needed for the initial page to avoid import 'waterfalls', resulting in faster application startup. There
are three strategies with different trade-offs:
- `modulepreload` - uses `<link rel="modulepreload">`. This delivers the best results in Chromium-based browsers, in Firefox 115+, and Safari 17+. It is ignored in older browsers.
- `preload-js` - uses `<link rel="preload">`. Prevents waterfalls in Chromium and Safari, but Chromium will parse each module twice (once as a script, once as a module). Causes modules to be requested twice in Firefox. This is a good setting if you want to maximise performance for users on iOS devices at the cost of a very slight degradation for Chromium users.
- `preload-mjs` - uses `<link rel="preload">` but with the `.mjs` extension which prevents double-parsing in Chromium. Some static webservers will fail to serve .mjs files with a `Content-Type: application/javascript` header, which will cause your application to break. If that doesn't apply to you, this is the option that will deliver the best performance for the largest number of users, until `modulepreload` is more widely supported.

</div>
</div>

</div>

## paths

<div class="ts-block-property-bullets">



</div>



<div class="ts-block-property-children">

<div class="ts-block-property">

```ts
// @noErrors
assets?: '' | `http://${string}` | `https://${string}`;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `""`

</div>

An absolute path that your app's files are served from. This is useful if your files are served from a storage bucket of some kind.

</div>
</div>
<div class="ts-block-property">

```ts
// @noErrors
base?: '' | `/${string}`;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `""`

</div>

A root-relative path that must start, but not end with `/` (e.g. `/base-path`), unless it is the empty string. This specifies where your app is served from and allows the app to live on a non-root path. Note that you need to prepend all your root-relative links with the base value or they will point to the root of your domain, not your `base` (this is how the browser works). You can use [`base` from `$app/paths`](/docs/kit/reference/$app-paths#base) for that: `<a href="{base}/your-page">Link</a>`. If you find yourself writing this often, it may make sense to extract this into a reusable component.

</div>
</div>
<div class="ts-block-property">

```ts
// @noErrors
relative?: boolean;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `true`

</div>

Whether to use relative asset paths.

If `true`, `base` and `assets` imported from `$app/paths` will be replaced with relative asset paths during server-side rendering, resulting in more portable HTML.
If `false`, `%sveltekit.assets%` and references to build artifacts will always be root-relative paths, unless `paths.assets` is an external URL

[Single-page app](https://kit.svelte.dev/docs/single-page-apps) fallback pages will always use absolute paths, regardless of this setting.

If your app uses a `<base>` element, you should set this to `false`, otherwise asset URLs will incorrectly be resolved against the `<base>` URL rather than the current page.

In 1.0, `undefined` was a valid value, which was set by default. In that case, if `paths.assets` was not external, SvelteKit would replace `%sveltekit.assets%` with a relative path and use relative paths to reference build artifacts, but `base` and `assets` imported from `$app/paths` would be as specified in your config.

</div>
</div>

</div>

## prerender

<div class="ts-block-property-bullets">



</div>

See [Prerendering](https://kit.svelte.dev/docs/page-options#prerender).

<div class="ts-block-property-children">

<div class="ts-block-property">

```ts
// @noErrors
concurrency?: number;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `1`

</div>

How many pages can be prerendered simultaneously. JS is single-threaded, but in cases where prerendering performance is network-bound (for example loading content from a remote CMS) this can speed things up by processing other tasks while waiting on the network response.

</div>
</div>
<div class="ts-block-property">

```ts
// @noErrors
crawl?: boolean;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `true`

</div>

Whether SvelteKit should find pages to prerender by following links from `entries`.

</div>
</div>
<div class="ts-block-property">

```ts
// @noErrors
entries?: Array<'*' | `/${string}`>;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `["*"]`

</div>

An array of pages to prerender, or start crawling from (if `crawl: true`). The `*` string includes all routes containing no required `[parameters]`  with optional parameters included as being empty (since SvelteKit doesn't know what value any parameters should have).

</div>
</div>
<div class="ts-block-property">

```ts
// @noErrors
handleHttpError?: PrerenderHttpErrorHandlerValue;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `"fail"`

</div>

How to respond to HTTP errors encountered while prerendering the app.

- `'fail'` — fail the build
- `'ignore'` - silently ignore the failure and continue
- `'warn'` — continue, but print a warning
- `(details) => void` — a custom error handler that takes a `details` object with `status`, `path`, `referrer`, `referenceType` and `message` properties. If you `throw` from this function, the build will fail

```js
// @errors: 7031
/// file: svelte.config.js
/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		prerender: {
			handleHttpError: ({ path, referrer, message }) => {
				// ignore deliberate link to shiny 404 page
				if (path === '/not-found' && referrer === '/blog/how-we-built-our-404-page') {
					return;
				}

				// otherwise fail the build
				throw new Error(message);
			}
		}
	}
};
```

</div>
</div>
<div class="ts-block-property">

```ts
// @noErrors
handleMissingId?: PrerenderMissingIdHandlerValue;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `"fail"`

</div>

How to respond when hash links from one prerendered page to another don't correspond to an `id` on the destination page.

- `'fail'` — fail the build
- `'ignore'` - silently ignore the failure and continue
- `'warn'` — continue, but print a warning
- `(details) => void` — a custom error handler that takes a `details` object with `path`, `id`, `referrers` and `message` properties. If you `throw` from this function, the build will fail

</div>
</div>
<div class="ts-block-property">

```ts
// @noErrors
handleEntryGeneratorMismatch?: PrerenderEntryGeneratorMismatchHandlerValue;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `"fail"`

</div>

How to respond when an entry generated by the `entries` export doesn't match the route it was generated from.

- `'fail'` — fail the build
- `'ignore'` - silently ignore the failure and continue
- `'warn'` — continue, but print a warning
- `(details) => void` — a custom error handler that takes a `details` object with `generatedFromId`, `entry`, `matchedId` and `message` properties. If you `throw` from this function, the build will fail

</div>
</div>
<div class="ts-block-property">

```ts
// @noErrors
origin?: string;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `"http://sveltekit-prerender"`

</div>

The value of `url.origin` during prerendering; useful if it is included in rendered content.

</div>
</div>

</div>

## serviceWorker

<div class="ts-block-property-bullets">



</div>



<div class="ts-block-property-children">

<div class="ts-block-property">

```ts
// @noErrors
register?: boolean;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `true`

</div>

Whether to automatically register the service worker, if it exists.

</div>
</div>
<div class="ts-block-property">

```ts
// @noErrors
files?(filepath: string): boolean;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `(filename) => !/\.DS_Store/.test(filename)`

</div>

Determine which files in your `static` directory will be available in `$service-worker.files`.

</div>
</div>

</div>

## typescript

<div class="ts-block-property-bullets">



</div>



<div class="ts-block-property-children">

<div class="ts-block-property">

```ts
// @noErrors
config?: (config: Record<string, any>) => Record<string, any> | void;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `(config) => config`

</div>

A function that allows you to edit the generated `tsconfig.json`. You can mutate the config (recommended) or return a new one.
This is useful for extending a shared `tsconfig.json` in a monorepo root, for example.

</div>
</div>

</div>

## version

<div class="ts-block-property-bullets">



</div>

Client-side navigation can be buggy if you deploy a new version of your app while people are using it. If the code for the new page is already loaded, it may have stale content; if it isn't, the app's route manifest may point to a JavaScript file that no longer exists.
SvelteKit helps you solve this problem through version management.
If SvelteKit encounters an error while loading the page and detects that a new version has been deployed (using the `name` specified here, which defaults to a timestamp of the build) it will fall back to traditional full-page navigation.
Not all navigations will result in an error though, for example if the JavaScript for the next page is already loaded. If you still want to force a full-page navigation in these cases, use techniques such as setting the `pollInterval` and then using `beforeNavigate`:
```html
/// file: +layout.svelte
<script>
	import { beforeNavigate } from '$app/navigation';
	import { updated } from '$app/stores';

	beforeNavigate(({ willUnload, to }) => {
		if ($updated && !willUnload && to?.url) {
			location.href = to.url.href;
		}
	});
</script>
```

If you set `pollInterval` to a non-zero value, SvelteKit will poll for new versions in the background and set the value of the [`updated`](/docs/kit/reference/$app-stores#updated) store to `true` when it detects one.

<div class="ts-block-property-children">

<div class="ts-block-property">

```ts
// @noErrors
name?: string;
```

<div class="ts-block-property-details">

The current app version string. If specified, this must be deterministic (e.g. a commit ref rather than `Math.random()` or `Date.now().toString()`), otherwise defaults to a timestamp of the build.

For example, to use the current commit hash, you could do use `git rev-parse HEAD`:

```js
// @errors: 7031
/// file: svelte.config.js
import * as child_process from 'node:child_process';

export default {
	kit: {
		version: {
			name: child_process.execSync('git rev-parse HEAD').toString().trim()
		}
	}
};
```

</div>
</div>
<div class="ts-block-property">

```ts
// @noErrors
pollInterval?: number;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `0`

</div>

The interval in milliseconds to poll for version changes. If this is `0`, no polling occurs.

</div>
</div>

</div>
<!-- @include_end KitConfig -->

<!-- @include_start Config -->
<div class="ts-block">

```dts
interface Config {/*…*/}
```

<div class="ts-block-property">

```dts
compilerOptions?: CompileOptions;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `{}`

</div>

Options passed to [`svelte.compile`](https://svelte.dev/docs#compile-time-svelte-compile).

</div>
</div>

<div class="ts-block-property">

```dts
extensions?: string[];
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `[".svelte"]`

</div>

List of file extensions that should be treated as Svelte files.

</div>
</div>

<div class="ts-block-property">

```dts
kit?: KitConfig;
```

<div class="ts-block-property-details">

SvelteKit options

</div>
</div>

<div class="ts-block-property">

```dts
preprocess?: any;
```

<div class="ts-block-property-details">

Preprocessor options, if any. Preprocessing can alternatively also be done through Vite's preprocessor capabilities.

</div>
</div>

<div class="ts-block-property">

```dts
vitePlugin?: PluginOptions;
```

<div class="ts-block-property-details">

`vite-plugin-svelte` plugin options.

</div>
</div>

<div class="ts-block-property">

```dts
[key: string]: any;
```

<div class="ts-block-property-details">

Any additional options required by tooling that integrates with Svelte.

</div>
</div>
</div>


<!-- @include_end Config -->

