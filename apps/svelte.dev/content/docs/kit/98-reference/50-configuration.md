---
title: Configuration
---

Your project's configuration lives in a `svelte.config.js` file at the root of your project. As well as SvelteKit, this config object is used by other tooling that integrates with Svelte such as editor extensions.

```js
/// file: svelte.config.js
// @filename: ambient.d.ts
declare module '@sveltejs/adapter-auto' {
	const plugin: () => import('@sveltejs/kit').Adapter;
	export default plugin;
}

// @filename: index.js
// ---cut---
import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter()
	}
};

export default config;
```

## Config

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

Options passed to [`svelte.compile`](https://svelte.dev/docs/svelte/svelte-compiler#CompileOptions).

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
</div></div>



## KitConfig

The `kit` property configures SvelteKit, and can have the following properties:

## adapter

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `undefined`

</div>

Your [adapter](https://svelte.dev/docs/kit/adapters) is run when executing `vite build`. It determines how the output is converted for different platforms.

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

> [!NOTE] The built-in `$lib` alias is controlled by `config.kit.files.lib` as it is used for packaging.

> [!NOTE] You will need to run `npm run dev` to have SvelteKit automatically generate the required alias configuration in `jsconfig.json` or `tsconfig.json`.

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
			// must be specified with either the `report-uri` or `report-to` directives, or both
			reportOnly: {
				'script-src': ['self'],
				'report-uri': ['/']
			}
		}
	}
};

export default config;
```

...would prevent scripts loading from external sites. SvelteKit will augment the specified directives with nonces or hashes (depending on `mode`) for any inline styles and scripts it generates.

To add a nonce for scripts and links manually included in `src/app.html`, you may use the placeholder `%sveltekit.nonce%` (for example `<script nonce="%sveltekit.nonce%">`).

When pages are prerendered, the CSP header is added via a `<meta http-equiv>` tag (note that in this case, `frame-ancestors`, `report-uri` and `sandbox` directives will be ignored).

> [!NOTE] When `mode` is `'auto'`, SvelteKit will use nonces for dynamically rendered pages and hashes for prerendered pages. Using nonces with prerendered pages is insecure and therefore forbidden.

> [!NOTE] Note that most [Svelte transitions](https://svelte.dev/tutorial/svelte/transition) work by creating an inline `<style>` element. If you use these in your app, you must either leave the `style-src` directive unspecified or add `unsafe-inline`.

If this level of configuration is insufficient and you have more dynamic requirements, you can use the [`handle` hook](https://svelte.dev/docs/kit/hooks#Server-hooks-handle) to roll your own CSP.

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

A prefix that signals that an environment variable is safe to expose to client-side code. See [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public) and [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public). Note that Vite's [`envPrefix`](https://vitejs.dev/config/shared-options.html#envprefix) must be set separately if you are using Vite's environment variable handling - though use of that feature should generally be unnecessary.

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
- <span class="tag since">available since</span> v1.21.0

</div>

A prefix that signals that an environment variable is unsafe to expose to client-side code. Environment variables matching neither the public nor the private prefix will be discarded completely. See [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) and [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private).

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

The location of your client [hooks](https://svelte.dev/docs/kit/hooks).

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

The location of your server [hooks](https://svelte.dev/docs/kit/hooks).

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
- <span class="tag since">available since</span> v2.3.0

</div>

The location of your universal [hooks](https://svelte.dev/docs/kit/hooks).

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

a directory containing [parameter matchers](https://svelte.dev/docs/kit/advanced-routing#Matching)

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

the files that define the structure of your app (see [Routing](https://svelte.dev/docs/kit/routing))

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

the location of your service worker's entry point (see [Service workers](https://svelte.dev/docs/kit/service-workers))

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

> [!NOTE] This results in fewer initial requests and can improve your [First Contentful Paint](https://web.dev/first-contentful-paint) score. However, it generates larger HTML output and reduces the effectiveness of browser caches. Use it advisedly.

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
- <span class="tag since">available since</span> v1.8.4

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

A root-relative path that must start, but not end with `/` (e.g. `/base-path`), unless it is the empty string. This specifies where your app is served from and allows the app to live on a non-root path. Note that you need to prepend all your root-relative links with the base value or they will point to the root of your domain, not your `base` (this is how the browser works). You can use [`base` from `$app/paths`](https://svelte.dev/docs/kit/$app-paths#base) for that: `<a href="{base}/your-page">Link</a>`. If you find yourself writing this often, it may make sense to extract this into a reusable component.

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
- <span class="tag since">available since</span> v1.9.0

</div>

Whether to use relative asset paths.

If `true`, `base` and `assets` imported from `$app/paths` will be replaced with relative asset paths during server-side rendering, resulting in more portable HTML.
If `false`, `%sveltekit.assets%` and references to build artifacts will always be root-relative paths, unless `paths.assets` is an external URL

[Single-page app](https://svelte.dev/docs/kit/single-page-apps) fallback pages will always use absolute paths, regardless of this setting.

If your app uses a `<base>` element, you should set this to `false`, otherwise asset URLs will incorrectly be resolved against the `<base>` URL rather than the current page.

In 1.0, `undefined` was a valid value, which was set by default. In that case, if `paths.assets` was not external, SvelteKit would replace `%sveltekit.assets%` with a relative path and use relative paths to reference build artifacts, but `base` and `assets` imported from `$app/paths` would be as specified in your config.

</div>
</div>

</div>

## prerender

<div class="ts-block-property-bullets">



</div>

See [Prerendering](https://svelte.dev/docs/kit/page-options#prerender).

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
- <span class="tag since">available since</span> v1.15.7

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
- <span class="tag since">available since</span> v1.15.7

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
- <span class="tag since">available since</span> v1.16.0

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
- <span class="tag since">available since</span> v1.3.0

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

If you set `pollInterval` to a non-zero value, SvelteKit will poll for new versions in the background and set the value of the [`updated`](https://svelte.dev/docs/kit/$app-stores#updated) store to `true` when it detects one.

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
