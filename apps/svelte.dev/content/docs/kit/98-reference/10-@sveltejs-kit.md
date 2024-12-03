---
title: @sveltejs/kit
---



```js
// @noErrors
import {
	Server,
	VERSION,
	error,
	fail,
	isActionFailure,
	isHttpError,
	isRedirect,
	json,
	redirect,
	text
} from '@sveltejs/kit';
```

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
</div></div>



## VERSION

<div class="ts-block">

```dts
const VERSION: string;
```

</div>



## error

Throws an error with a HTTP status code and an optional message.
When called during request handling, this will cause SvelteKit to
return an error response without invoking `handleError`.
Make sure you're not catching the thrown error, which would prevent SvelteKit from handling it.

<div class="ts-block">

```dts
function error(status: number, body: App.Error): never;
```

</div>

<div class="ts-block">

```dts
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

```dts
function fail(status: number): ActionFailure<undefined>;
```

</div>

<div class="ts-block">

```dts
function fail<
	T extends Record<string, unknown> | undefined = undefined
>(status: number, data: T): ActionFailure<T>;
```

</div>



## isActionFailure

Checks whether this is an action failure thrown by `fail`.

<div class="ts-block">

```dts
function isActionFailure(e: unknown): e is ActionFailure;
```

</div>



## isHttpError

Checks whether this is an error thrown by `error`.

<div class="ts-block">

```dts
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

```dts
function isRedirect(e: unknown): e is Redirect_1;
```

</div>



## json

Create a JSON `Response` object from the supplied data.

<div class="ts-block">

```dts
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

```dts
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

```dts
function text(
	body: string,
	init?: ResponseInit | undefined
): Response;
```

</div>



## Action

Shape of a form action method that is part of `export const actions = {..}` in `+page.server.js`.
See [form actions](/docs/kit/form-actions) for more information.

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
</div></div>

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
See [form actions](/docs/kit/form-actions) for more information.

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

[Adapters](/docs/kit/adapters) are responsible for taking the production build and turning it into something that can be deployed to a platform of your choosing.

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
</div></div>

## AfterNavigate

The argument passed to [`afterNavigate`](/docs/kit/$app-navigation#afterNavigate) callbacks.

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
</div></div>

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

The argument passed to [`beforeNavigate`](/docs/kit/$app-navigation#beforeNavigate) callbacks.

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
</div></div>

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

Generate a server-side manifest to initialise the SvelteKit [server](https://svelte.dev/docs/kit/@sveltejs-kit#Server) with.

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
</div></div>

## Config

See the [configuration reference](/docs/kit/configuration) for details.

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
</div></div>

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
</div></div>

## Handle

The [`handle`](/docs/kit/hooks#Server-hooks-handle) hook runs every time the SvelteKit server receives a [request](/docs/kit/web-standards#Fetch-APIs-Request) and
determines the [response](/docs/kit/web-standards#Fetch-APIs-Response).
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

The client-side [`handleError`](/docs/kit/hooks#Shared-hooks-handleError) hook runs when an unexpected error is thrown while navigating.

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

The [`handleFetch`](/docs/kit/hooks#Server-hooks-handleFetch) hook allows you to modify (or replace) a `fetch` request that happens inside a `load` function that runs on the server (or during pre-rendering)

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

The server-side [`handleError`](/docs/kit/hooks#Shared-hooks-handleError) hook runs when an unexpected error is thrown while responding to a request.

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

The object returned by the [`error`](/docs/kit/@sveltejs-kit#error) function.

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
</div></div>

## KitConfig

See the [configuration reference](/docs/kit/configuration) for details.

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

The generic form of `PageLoad` and `LayoutLoad`. You should import those from `./$types` (see [generated types](/docs/kit/types#Generated-types))
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

The generic form of `PageLoadEvent` and `LayoutLoadEvent`. You should import those from `./$types` (see [generated types](/docs/kit/types#Generated-types))
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
- During server-side rendering, the response will be captured and inlined into the rendered HTML by hooking into the `text` and `json` methods of the `Response` object. Note that headers will _not_ be serialized, unless explicitly included via [`filterSerializedResponseHeaders`](https://svelte.dev/docs/kit/hooks#Server-hooks-handle)
- During hydration, the response will be read from the HTML, guaranteeing consistency and preventing an additional network request.

You can learn more about making credentialed requests with cookies [here](https://svelte.dev/docs/kit/load#Cookies)

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

You cannot add a `set-cookie` header with `setHeaders` — use the [`cookies`](https://svelte.dev/docs/kit/@sveltejs-kit#Cookies) API in a server-only `load` function instead.

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

This function declares that the `load` function has a _dependency_ on one or more URLs or custom identifiers, which can subsequently be used with [`invalidate()`](https://svelte.dev/docs/kit/$app-navigation#invalidate) to cause `load` to rerun.

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

	let { data } = $props();

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
</div></div>

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
</div></div>

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
</div></div>

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
</div></div>

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

The argument passed to [`onNavigate`](/docs/kit/$app-navigation#onNavigate) callbacks.

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
</div></div>

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

The page state, which can be manipulated using the [`pushState`](https://svelte.dev/docs/kit/$app-navigation#pushState) and [`replaceState`](https://svelte.dev/docs/kit/$app-navigation#replaceState) functions from `$app/navigation`.

</div>
</div>

<div class="ts-block-property">

```dts
form: any;
```

<div class="ts-block-property-details">

Filled only after a form submission. See [form actions](https://svelte.dev/docs/kit/form-actions) for more info.

</div>
</div></div>

## ParamMatcher

The shape of a param matcher. See [matching](/docs/kit/advanced-routing#Matching) for more info.

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

The object returned by the [`redirect`](/docs/kit/@sveltejs-kit#redirect) function

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
</div></div>

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
- During server-side rendering, the response will be captured and inlined into the rendered HTML by hooking into the `text` and `json` methods of the `Response` object. Note that headers will _not_ be serialized, unless explicitly included via [`filterSerializedResponseHeaders`](https://svelte.dev/docs/kit/hooks#Server-hooks-handle)
- During hydration, the response will be read from the HTML, guaranteeing consistency and preventing an additional network request.

You can learn more about making credentialed requests with cookies [here](https://svelte.dev/docs/kit/load#Cookies)

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

Contains custom data that was added to the request within the [`server handle hook`](https://svelte.dev/docs/kit/hooks#Server-hooks-handle).

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

You cannot add a `set-cookie` header with `setHeaders` — use the [`cookies`](https://svelte.dev/docs/kit/@sveltejs-kit#Cookies) API instead.

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
</div></div>

## RequestHandler

A `(event: RequestEvent) => Response` function exported from a `+server.js` file that corresponds to an HTTP verb (`GET`, `PUT`, `PATCH`, etc) and handles requests with that method.

It receives `Params` as the first generic argument, which you can skip by using [generated types](/docs/kit/types#Generated-types) instead.

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

The [`reroute`](/docs/kit/hooks#Universal-hooks-reroute) hook allows you to modify the URL before it is used to determine which route to render.

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
</div></div>

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
</div></div>

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
</div></div>

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
</div></div>

## ServerLoad

The generic form of `PageServerLoad` and `LayoutServerLoad`. You should import those from `./$types` (see [generated types](/docs/kit/types#Generated-types))
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

This function declares that the `load` function has a _dependency_ on one or more URLs or custom identifiers, which can subsequently be used with [`invalidate()`](https://svelte.dev/docs/kit/$app-navigation#invalidate) to cause `load` to rerun.

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

	let { data } = $props();

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
</div></div>

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
</div></div>

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



## Private types

The following are referenced by the public types documented above, but cannot be imported directly:

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
</div></div>

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
</div></div>

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
</div></div>

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
</div></div>

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
</div></div>

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
</div></div>

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
</div></div>

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
</div></div>

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
</div></div>

## TrailingSlash

<div class="ts-block">

```dts
type TrailingSlash = 'never' | 'always' | 'ignore';
```

</div>


