---
title: Modules
---

SvelteKit makes a number of modules available to your application.

## $app/environment



```js
// @noErrors
import { browser, building, dev, version } from '$app/environment';
```





### browser

`true` if the app is running in the browser.

<div class="ts-block">

```ts
// @noErrors
const browser: boolean;
```

</div>

### building

SvelteKit analyses your app during the `build` step by running it. During this process, `building` is `true`. This also applies during prerendering.

<div class="ts-block">

```ts
// @noErrors
const building: boolean;
```

</div>

### dev

Whether the dev server is running. This is not guaranteed to correspond to `NODE_ENV` or `MODE`.

<div class="ts-block">

```ts
// @noErrors
const dev: boolean;
```

</div>

### version

The value of `config.kit.version.name`.

<div class="ts-block">

```ts
// @noErrors
const version: string;
```

</div>

## $app/forms



```js
// @noErrors
import { applyAction, deserialize, enhance } from '$app/forms';
```





### applyAction

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

### deserialize

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

### enhance

This action enhances a `<form>` element that otherwise would work without JavaScript.

The `submit` function is called upon submission with the given FormData and the `action` that should be triggered.
If `cancel` is called, the form will not be submitted.
You can use the abort `controller` to cancel the submission in case another one starts.
If a function is returned, that function is called with the response from the server.
If nothing is returned, the fallback will be used.

If this function or its return value isn't set, it
- falls back to updating the `form` prop with the returned data if the action is on the same page as the form
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

## $app/navigation



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





### afterNavigate

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

### beforeNavigate

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

### disableScrollHandling

If called when the page is being updated following a navigation (in `onMount` or `afterNavigate` or an action, for example), this disables SvelteKit's built-in scroll handling.
This is generally discouraged, since it breaks user expectations.

<div class="ts-block">

```ts
// @noErrors
function disableScrollHandling(): void;
```

</div>

### goto

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

### invalidate

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

### invalidateAll

Causes all `load` functions belonging to the currently active page to re-run. Returns a `Promise` that resolves when the page is subsequently updated.

<div class="ts-block">

```ts
// @noErrors
function invalidateAll(): Promise<void>;
```

</div>

### onNavigate

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

### preloadCode

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

### preloadData

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

### pushState

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

### replaceState

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

## $app/paths



```js
// @noErrors
import { assets, base, resolveRoute } from '$app/paths';
```





### assets

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

### base

A string that matches [`config.kit.paths.base`](/docs/kit/reference/configuration#paths).

Example usage: `<a href="{base}/your-page">Link</a>`

<div class="ts-block">

```ts
// @noErrors
let base: '' | `/${string}`;
```

</div>

### resolveRoute

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

## $app/server



```js
// @noErrors
import { read } from '$app/server';
```





### read

Read the contents of an imported asset from the filesystem

<div class="ts-block">

```ts
// @noErrors
function read(asset: string): Response;
```

</div>

## $app/stores



```js
// @noErrors
import { getStores, navigating, page, updated } from '$app/stores';
```





### getStores



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

### navigating

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

### page

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

### updated

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

## $env/dynamic/private



This module provides access to runtime environment variables, as defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](/docs/kit/reference/cli)), this is equivalent to `process.env`. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](/docs/kit/reference/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](/docs/kit/reference/configuration#env) (if configured).

This module cannot be imported into client-side code.

Dynamic environment variables cannot be used during prerendering.

```ts
import { env } from '$env/dynamic/private';
console.log(env.DEPLOYMENT_SPECIFIC_VARIABLE);
```

> In `dev`, `$env/dynamic` always includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.




## $env/dynamic/public



Similar to [`$env/dynamic/private`](/docs/kit/reference/$env-all#$env-dynamic-private), but only includes variables that begin with [`config.kit.env.publicPrefix`](/docs/kit/reference/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.

Note that public dynamic environment variables must all be sent from the server to the client, causing larger network requests — when possible, use `$env/static/public` instead.

Dynamic environment variables cannot be used during prerendering.

```ts
import { env } from '$env/dynamic/public';
console.log(env.PUBLIC_DEPLOYMENT_SPECIFIC_VARIABLE);
```




## $env/static/private



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




## $env/static/public



Similar to [`$env/static/private`](/docs/kit/reference/$env-all#$env-static-private), except that it only includes environment variables that begin with [`config.kit.env.publicPrefix`](/docs/kit/reference/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.

Values are replaced statically at build time.

```ts
import { PUBLIC_BASE_URL } from '$env/static/public';
```




## $lib



This is a simple alias to `src/lib`, or whatever directory is specified as [`config.kit.files.lib`](/docs/kit/reference/configuration#files). It allows you to access common components and utility modules without `../../../../` nonsense.

### `$lib/server`

A subdirectory of `$lib`. SvelteKit will prevent you from importing any modules in `$lib/server` into client-side code. See [server-only modules](/docs/server-only-modules).




## $service-worker



```js
// @noErrors
import { base, build, files, prerendered, version } from '$service-worker';
```



This module is only available to [service workers](/docs/service-workers).

### base

The `base` path of the deployment. Typically this is equivalent to `config.kit.paths.base`, but it is calculated from `location.pathname` meaning that it will continue to work correctly if the site is deployed to a subdirectory.
Note that there is a `base` but no `assets`, since service workers cannot be used if `config.kit.paths.assets` is specified.

<div class="ts-block">

```ts
// @noErrors
const base: string;
```

</div>

### build

An array of URL strings representing the files generated by Vite, suitable for caching with `cache.addAll(build)`.
During development, this is an empty array.

<div class="ts-block">

```ts
// @noErrors
const build: string[];
```

</div>

### files

An array of URL strings representing the files in your static directory, or whatever directory is specified by `config.kit.files.assets`. You can customize which files are included from `static` directory using [`config.kit.serviceWorker.files`](/docs/kit/reference/configuration)

<div class="ts-block">

```ts
// @noErrors
const files: string[];
```

</div>

### prerendered

An array of pathnames corresponding to prerendered pages and endpoints.
During development, this is an empty array.

<div class="ts-block">

```ts
// @noErrors
const prerendered: string[];
```

</div>

### version

See [`config.kit.version`](/docs/kit/reference/configuration#version). It's useful for generating unique cache names inside your service worker, so that a later deployment of your app can invalidate old caches.

<div class="ts-block">

```ts
// @noErrors
const version: string;
```

</div>

## @sveltejs/kit



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





### VERSION



<div class="ts-block">

```ts
// @noErrors
const VERSION: string;
```

</div>

### error

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

### error

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

### fail

Create an `ActionFailure` object.

<div class="ts-block">

```ts
// @noErrors
function fail(status: number): ActionFailure<undefined>;
```

</div>

### fail

Create an `ActionFailure` object.

<div class="ts-block">

```ts
// @noErrors
function fail<
	T extends Record<string, unknown> | undefined = undefined
>(status: number, data: T): ActionFailure<T>;
```

</div>

### isHttpError

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

### isRedirect

Checks whether this is a redirect thrown by `redirect`.

<div class="ts-block">

```ts
// @noErrors
function isRedirect(e: unknown): e is Redirect_1;
```

</div>

### json

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

### redirect

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

### text

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

## @sveltejs/kit/hooks



```js
// @noErrors
import { sequence } from '@sveltejs/kit/hooks';
```





### sequence

A helper function for sequencing multiple `handle` calls in a middleware-like manner.
The behavior for the `handle` options is as follows:
- `transformPageChunk` is applied in reverse order and merged
- `preload` is applied in forward order, the first option "wins" and no `preload` options after it are called
- `filterSerializedResponseHeaders` behaves the same as `preload`

```js
// @errors: 7031
/// file: src/hooks.server.js
import { sequence } from '@sveltejs/kit/hooks';

/** @type {import('@sveltejs/kit').Handle} */
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

/** @type {import('@sveltejs/kit').Handle} */
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

## @sveltejs/kit/node



```js
// @noErrors
import {
	createReadableStream,
	getRequest,
	setResponse
} from '@sveltejs/kit/node';
```





### createReadableStream

Converts a file on disk to a readable stream

<div class="ts-block">

```ts
// @noErrors
function createReadableStream(file: string): ReadableStream;
```

</div>

### getRequest



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

### setResponse



<div class="ts-block">

```ts
// @noErrors
function setResponse(
	res: import('http').ServerResponse,
	response: Response
): Promise<void>;
```

</div>

## @sveltejs/kit/node/polyfills



```js
// @noErrors
import { installPolyfills } from '@sveltejs/kit/node/polyfills';
```





### installPolyfills

Make various web APIs available as globals:
- `crypto`
- `File`

<div class="ts-block">

```ts
// @noErrors
function installPolyfills(): void;
```

</div>

## @sveltejs/kit/vite



```js
// @noErrors
import { sveltekit } from '@sveltejs/kit/vite';
```





### sveltekit

Returns the SvelteKit Vite plugins.

<div class="ts-block">

```ts
// @noErrors
function sveltekit(): Promise<import('vite').Plugin[]>;
```

</div>




