## Project types

SvelteKit supports all rendering modes: SPA, SSR, SSG, and you can mix them within one project.

## Setup

Scaffold a new SvelteKit project using `npx sv create` then follow the instructions. Do NOT use `npm create svelte` anymore, this command is deprecated.

A SvelteKit project needs a `package.json` with the following contents at minimum:

```json
{
	"devDependencies": {
		"@sveltejs/adapter-auto": "^6.0.0",
		"@sveltejs/kit": "^2.0.0",
		"@sveltejs/vite-plugin-svelte": "^5.0.0",
		"svelte": "^5.0.0",
		"vite": "^6.0.0"
	}
}
```

Do NOT put any of the `devDependencies` listed above into `dependencies`, keep them all in `devDependencies`.

It also needs a `vite.config.js` with the following at minimum:

```js
import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [sveltekit()]
});
```

It also needs a `svelte.config.js` with the following at minimum:

```js
import adapter from '@sveltejs/adapter-auto';

export default {
	kit: {
		adapter: adapter()
	}
};
```

## Project structure

- **`src/` directory:**
  - `lib/` for shared code (`$lib`), `lib/server/` for server‑only modules (`$lib/server`), `params/` for matchers, `routes/` for your pages/components, plus `app.html`, `error.html`, `hooks.client.js`, `hooks.server.js`, and `service-worker.js`.
  - Do **NOT** import server‑only code into client files
- **Top‑level assets & configs:**
  - `static/` for public assets; `tests/` (if using Playwright); config files: `package.json` (with `@sveltejs/kit`, `svelte`, `vite` as devDeps), `svelte.config.js`, `tsconfig.json` (or `jsconfig.json`, extending `.svelte-kit/tsconfig.json`), and `vite.config.js`.
  - Do **NOT** forget `"type": "module"` in `package.json` if using ESM.
- **Build artifacts:**
  - `.svelte-kit/` is auto‑generated and safe to ignore or delete; it will be recreated on `dev`/`build`.
  - Do **NOT** commit `.svelte-kit/` to version control.

## Web standards

- **Fetch API & HTTP primitives:**
  - Use `fetch` on server/routes/hooks and in the browser (`Request`, `Response`, `Headers`), plus `json()` helper.
  - Do **NOT** roll your own HTTP parsing; instead use the platform’s `fetch` and `Request`/`Response` interfaces.
- **FormData & Streams:**
  - Handle form submissions with `await event.request.formData()`, and stream large or chunked responses with `ReadableStream`/`WritableStream`/`TransformStream`.
  - Do **NOT** load huge payloads into memory entirely; instead use streams when appropriate.
- **URL APIs & Web Crypto:**
  - Access `event.url` or `page.url`, use `url.searchParams` for queries, and generate secure values with `crypto.randomUUID()`.
  - Do **NOT** manually parse query strings or roll your own UUIDs; instead rely on `URLSearchParams` and the Web Crypto API.

## Routing

- **Filesystem router:** `src/routes` maps directories to URL paths: Everything with a `+page.svelte` file inside it becomes a visitable URL, e.g. `src/routes/hello/+page.svelte` becomes `/hello`. `[param]` folders define dynamic segments. Do NOT use other file system router conventions, e.g. `src/routes/hello.svelte` does NOT become available als URL `/hello`
- **Route files:** Prefix with `+`: all run server‑side; only non‑`+server` run client‑side; `+layout`/`+error` apply recursively.
- **Best practice:** Do **not** hard‑code routes in code; instead rely on the filesystem convention.

### +page.svelte

- Defines UI for a route, SSR on first load and CSR thereafter
- Do **not** fetch data inside the component; instead use a `+page.js` or `+page.server.js` `load` function; access its return value through `data` prop via `let { data } = $props()` (typed with `PageProps`).

```svelte
<script lang="ts">
  import type { PageProps } from './$types';
  let { data }: PageProps = $props();
</script>
<h1>{data.title}</h1>
```

### +page.js

- Load data for pages via `export function load({ params })` (typed `PageLoad`), return value is put into `data` prop in component
- Can export `prerender`, `ssr`, and `csr` consts here to influence how page is rendered.
- Do **not** include private logic (DB or env vars); if needed, use `+page.server.js`.

```js
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
  return {
    title: 'Hello world!',
  };
}
```

### +page.server.js

- `export async function load(...)` (typed `PageServerLoad`) to access databases or private env; return serializable data.
- Can also export `actions` for `<form>` handling on the server.

### +error.svelte

- Add `+error.svelte` in a route folder to render an error page, can use `page.status` and `page.error.message` from `$app/state`.
- SvelteKit walks up routes to find the closest boundary; falls back to `src/error.html` if none.

### +layout.svelte

- Place persistent elements (nav, footer) and include `{@render children()}` to render page content. Example:

```svelte
<script>
    import { LayoutProps } from './$types';
    let { children, data } = $props();
</script>

<p>Some Content that is shared for all pages below this layout</p>
<!-- child layouts/page goes here -->
{@render children()}
```

- Create subdirectory `+layout.svelte` to scope UI to nested routes, inheriting parent layouts.
- Use layouts to avoid repeating common markup; do **not** duplicate UI in every `+page.svelte`.

### +layout.js / +layout.server.js

- In `+layout.js` or `+layout.server.js` export `load()` (typed `LayoutLoad`) to supply `data` to the layout and its children; set `prerender`, `ssr`, `csr`.
- Use `+layout.server.js` (typed `LayoutServerLoad`) for server-only things like DB or env access.
- Do **not** perform server‑only operations in `+layout.js`; use the server variant.

```js
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = () => {
	return {
		sections: [
			{ slug: 'profile', title: 'Profile' },
			{ slug: 'notifications', title: 'Notifications' }
		]
	};
}
```

### +server.js (Endpoints)

- Export HTTP handlers (`GET`, `POST`, etc.) in `+server.js` under `src/routes`; receive `RequestEvent`, return `Response` or use `json()`, `error()`, `redirect()` (exported from `@sveltejs/kit`).
- export `fallback` to catch all other methods.

```js
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ url }) => {
	return new Response('hello world');
}
```

### $types

- SvelteKit creates `$types.d.ts` with `PageProps`, `LayoutProps`, `RequestHandler`, `PageLoad`, etc., for type‑safe props and loaders.
- Use them inside `+page.svelte`/`+page.server.js`/`+page.js`/`+layout.svelte`/`+layout.server.js`/`+layout.js` by importing from `./$types`

### Other files

- Any non‑`+` files in route folders are ignored by the router, use this to your advantage to colocate utilities or components.
- For cross‑route imports, place modules under `src/lib` and import via `$lib`.

## Loading data

### Page data

- `+page.js` exports a `load` (`PageLoad`) whose returned object is available in `+page.svelte` via `let { data } = $props()` (e.g. when you do `return { foo }` from `load` it is available within `let { data } = $props()` in `+page.svelte` as `data.foo`)
- Universal loads run on SSR and CSR; private or DB‑backed loads belong in `+page.server.js` (`PageServerLoad`) and must return devalue‑serializable data.

Example:

```js
// file: src/routes/foo/+page.js
export async function load({ fetch }) {
	const result = await fetch('/data/from/somewhere').then((r) => r.json());
	return { result }; // return property "result"
}
```

```svelte
<!-- file: src/routes/foo/+page.svelte -->
<script>
  // "data" prop contains property "result"
  let { data } = $props();
</script>
{data.result}
```

### Layout data

- `+layout.js` or `+layout.server.js` exports a `load` (`LayoutLoad`/`LayoutServerLoad`)
- Layout data flows downward: child layouts and pages see parent data in their `data` prop.
- Data loading flow (interaction of load function and props) works the same as for `+page(.server).js/svelte`

### page.data

- The `page` object from `$app/state` gives access to all data from `load` functions via `page.data`, usable in any layout or page.
- Ideal for things like `<svelte:head><title>{page.data.title}</title></svelte:head>`.
- Types come from `App.PageData`
- earlier Svelte versions used `$app/stores` for the same concepts, do NOT use `$app/stores` anymore unless prompted to do so

### Universal vs. server loads

- Universal (`+*.js`) run on server first, then in browser; server (`+*.server.js`) always run server‑side and can use secrets, cookies, DB, etc.
- Both receive `params`, `route`, `url`, `fetch`, `setHeaders`, `parent`, `depends`; server loads additionally get `cookies`, `locals`, `platform`, `request`.
- Use server loads for private data or non‑serializable items; universal loads for public APIs or returning complex values (like constructors).

### Load function arguments

- `url` is a `URL` object (no `hash` server‑side); `route.id` shows the route pattern; `params` map path segments to values.
- Query parameters via `url.searchParams` trigger reruns when they change.
- Use these to branch logic and fetch appropriate data in `load`.

## Making Fetch Requests

Use the provided `fetch` function for enhanced features:

```js
// src/routes/items/[id]/+page.js
export async function load({ fetch, params }) {
	const res = await fetch(`/api/items/${params.id}`);
	const item = await res.json();
	return { item };
}
```

## Headers and Cookies

Set response headers using `setHeaders`:

```js
export async function load({ fetch, setHeaders }) {
	const response = await fetch(url);

	setHeaders({
		age: response.headers.get('age'),
		'cache-control': response.headers.get('cache-control')
	});

	return response.json();
}
```

Access cookies in server load functions using `cookies`:

```js
export async function load({ cookies }) {
	const sessionid = cookies.get('sessionid');
	return {
		user: await db.getUser(sessionid)
	};
}
```

Do not set `set-cookie` via `setHeaders`; use `cookies.set()` instead.

## Using Parent Data

Access data from parent load functions:

```js
export async function load({ parent }) {
	const { a } = await parent();
	return { b: a + 1 };
}
```

## Errors and Redirects

Redirect users using `redirect`:

```js
import { redirect } from '@sveltejs/kit';

export function load({ locals }) {
	if (!locals.user) {
		redirect(307, '/login');
	}
}
```

Throw expected errors using `error`:

```js
import { error } from '@sveltejs/kit';

export function load({ locals }) {
	if (!locals.user) {
		error(401, 'not logged in');
	}
}
```

Unexpected exceptions trigger `handleError` hook and a 500 response.

## Streaming with Promises

Server load functions can stream promises as they resolve:

```js
export async function load({ params }) {
	return {
		comments: loadComments(params.slug),
		post: await loadPost(params.slug)
	};
}
```

```svelte
<h1>{data.post.title}</h1>
<div>{@html data.post.content}</div>

{#await data.comments}
  Loading comments...
{:then comments}
  {#each comments as comment}
    <p>{comment.content}</p>
  {/each}
{:catch error}
  <p>error loading comments: {error.message}</p>
{/await}
```

## Rerunning Load Functions

Load functions rerun when:

- Referenced params or URL properties change
- A parent load function reran and `await parent()` was called
- A dependency was invalidated with `invalidate(url)` or `invalidateAll()`

Manually invalidate load functions:

```js
// In load function
export async function load({ fetch, depends }) {
	depends('app:random');
	// ...
}

// In component
import { invalidate } from '$app/navigation';
function rerunLoadFunction() {
	invalidate('app:random');
}
```

## Dependency Tracking

Exclude from dependency tracking with `untrack`:

```js
export async function load({ untrack, url }) {
	if (untrack(() => url.pathname === '/')) {
		return { message: 'Welcome!' };
	}
}
```

### Implications for authentication

- Layout loads don’t automatically rerun on CSR; guards in `+layout.server.js` require child pages to await the parent.
- To avoid missed auth checks and waterfalls, use hooks like `handle` for global protection or per‑page server loads.

### Using getRequestEvent

- `getRequestEvent()` retrieves the current server `RequestEvent`, letting shared functions (e.g. `requireLogin()`) access `locals`, `url`, etc., without parameter passing.

## Using forms

### Form actions

- A `+page.server.js` can export `export const actions: Actions = { default: async (event) => {…} }`; `<form method="POST">` in `+page.svelte` posts to the default action without any JS.
- Name multiple actions (`login`, `register`) in `actions`, invoke with `action="?/register"` or `button formaction="?/register"`; do NOT use `default` name in this case.
- Each action gets `{ request, cookies, params }`, uses `await request.formData()`, sets cookies or DB state, and returns an object that appears on the page as `form` (typed via `PageProps`).

Example: Define a default action in `+page.server.js`:

```js
// file: src/routes/login/+page.server.js
import type { Actions } from './$types';

export const actions: Actions = {
	default: async (event) => {
		// TODO log the user in
	}
};
```

Use it with a simple form:

```svelte
<!-- file: src/routes/login/+page.svelte -->
<form method="POST">
	<label>
		Email
		<input name="email" type="email">
	</label>
	<label>
		Password
		<input name="password" type="password">
	</label>
	<button>Log in</button>
</form>
```

### Validation errors

- Return `fail(400, { field, error: true })` from an action to send back status and data; display via `form?.field` and repopulate inputs with `value={form?.field ?? ''}`.
- Use `fail` instead of throwing so the nearest `+error.svelte` isn’t invoked and the user can correct their input.
- `fail` payload must be JSON‑serializable.

### Redirects

- In an action, call `redirect(status, location)` to send a 3xx redirect; this throws and bypasses form re-render.
- Client-side, use `goto()` from `$app/navigation` for programmatic redirects.

### Loading data after actions

- After an action completes (unless redirected), SvelteKit reruns `load` functions and re‑renders the page, merging the action’s return value into `form`.
- The `handle` hook runs once before the action; if you modify cookies in your action, you must also update `event.locals` there to keep `load` in sync.
- Do NOT assume `locals` persists automatically; set `event.locals` inside your action when auth state changes.

### Progressive enhancement

- Apply `use:enhance` from `$app/forms` to `<form>` to intercept submissions, prevent full reloads, update `form`, `page.form`, `page.status`, reset the form, invalidate all data, handle redirects, render errors, and restore focus.
- To customize, provide a callback that runs before submit and returns a handler; use `update()` for default logic or `applyAction(result)` to apply form data without full invalidation.
- You can also write your own `onsubmit` listener using `fetch`, then `deserialize` the response and `applyAction`/`invalidateAll`; do NOT use `JSON.parse` for action responses.

```svelte
<script>
  import type { PageProps } from './$types';
	import { enhance } from '$app/forms';
	let { form } = $props();
</script>

<form method="POST" use:enhance>
	<!-- form content -->
</form>
```

### Alternatives & GET vs POST

- For simple JSON APIs, use `+server.js` routes and `fetch` instead of actions; but you lose `<form>` semantics and progressive enhancement.
- `<form method="GET">` acts like an `<a>` tag, invoking `load` with query parameters and client routing, not an action.
- Do NOT use GET for data‑changing operations; reserve POST for actions that modify state.

## Page options

#### prerender

- Set `export const prerender = true|false|'auto'` in page or layout modules; `true` generates static HTML, `false` skips, `'auto'` includes in SSR manifest.
- Applies to pages **and** `+server.js` routes (inherit parent flags); dynamic routes need `entries()` or `config.kit.prerender.entries` to tell the crawler which parameter values to use.
- Do NOT prerender pages that use form actions or rely on `url.searchParams` server‑side.

#### entries

- In a dynamic route’s `+page(.server).js` or `+server.js`, export `export function entries(): Array<Record<string,string>>` (can be async) to list parameter sets for prerendering.
- Overrides default crawling to ensure dynamic pages (e.g. `/blog/[slug]`) are generated.
- Do NOT forget to pair `entries()` with `export const prerender = true`.

### ssr

- `export const ssr = false` disables server-side rendering, sending only an HTML shell and turning the page into a client-only SPA.
- Use sparingly (e.g. when using browser‑only globals); do NOT set both `ssr` and `csr` to `false` or nothing will render.

#### csr

- `export const csr = false` prevents hydration, omits JS bundle, disables `<script>`s, form enhancements, client routing, and HMR.
- Ideal for purely static pages (e.g. marketing or blog posts); do NOT disable CSR on pages requiring interactivity.

#### trailingSlash

- `export const trailingSlash = 'never'|'always'|'ignore'` controls URL normalization and prerender output (`about.html` vs `about/index.html`).
- Cascades through layouts and server routes; do NOT rely on default if you need consistent URL behavior across environments.

#### config

- `export const config: AdapterConfig = { … }` provides adapter-specific deployment settings; top‑level keys merge but nested objects are overwritten.
- Layout `config` values are inherited by child pages, which override only specified keys.
- Do NOT repeat the entire config for minor tweaks; specify only the properties you need to change.

## State management

- Avoid shared server variables—servers are stateless and shared across users. Authenticate via cookies and persist to a database instead of writing to in‑memory globals.
- Keep `load` functions pure: no side‑effects or global store writes. Return data from `load` and pass it via `data` or `page.data`.
- For shared client‑only state across components, use Svelte’s context API (`setContext`/`getContext`) or URL parameters for persistent filters; snapshots for ephemeral UI state tied to navigation history.

## Building your app

- Build runs in two phases: Vite compiles and prerenders (if enabled), then an adapter tailors output for your deployment target.
- Guard any code that should not execute at build time with `import { building } from '$app/environment'; if (!building) { … }`.
- Preview your production build locally with `npm run preview` (Node‑only, no adapter hooks).

## Adapters

- Adapters transform the built app into deployable assets for various platforms (Cloudflare, Netlify, Node, static, Vercel, plus community adapters).
- Configure in `svelte.config.js` under `kit.adapter = adapter(opts)`, importing the adapter module and passing its options.
- Some adapters expose a `platform` object (e.g. Cloudflare’s `env`); access it via `event.platform` in hooks and server routes.

## Single‑page apps

- Turn your app into a fully CSR SPA by setting `export const ssr = false;` in the root `+layout.js`.
- For static hosting, use `@sveltejs/adapter-static` with a `fallback` HTML (e.g. `200.html`) so client routing can handle unknown paths.
- You can still prerender select pages by enabling `prerender = true` and `ssr = true` in their individual `+page.js` or `+layout.js` modules.

## Advanced routing

- Rest parameters (`[...file]`) capture an unknown number of segments (e.g. `src/routes/hello/[...path]` catches all routes under `/hello`) and expose them as a single string; use a catch‑all route `+error.svelte` to render nested custom 404 pages.
- Optional parameters (`[[lang]]`) make a segment optional, e.g. for `[[lang]]/home` both `/home` and `/en/home` map to the same route; cannot follow a rest parameter.
- Matchers in `src/params/type.js` let you constrain `[param=type]` (e.g. only “apple” or “orange”), falling back to other routes or a 404 if the test fails.

### Sorting

- Routes are sorted by specificity: static > parameter with matcher > simple parameter > optional/rest > catch‑all.
- Alphabetical order breaks ties.
- Ensures `/foo-abc` matches `foo-abc` before `foo-[c]`, then optional, then `[b]`, then `[...catchall]`.

### Encoding

- Escape filesystem/URL‑reserved characters using `[x+nn]` (hex code) or `[u+nnnn]` (Unicode code point), e.g. `:-)` → `[x+3a]-[x+29]`.
- Surrogate pairs are unnecessary; code points up to `10ffff` work.
- Use `':'.charCodeAt(0).toString(16)` to compute hex codes.

### Advanced layouts

- Group directories `(app)` or `(marketing)` apply a shared layout without affecting URLs.
- Break out of the inherited layout chain per page with `+page@segment.svelte` (e.g. `+page@(app).svelte`) or per layout with `+layout@.svelte`.
- Use grouping judiciously: overuse can complicate nesting; sometimes simple composition or wrapper components suffice.

## Hooks

### Server hooks

- `handle({ event, resolve })`: runs on every request; mutate `event.locals`, bypass routing, or call `resolve(event, { transformPageChunk, filterSerializedResponseHeaders, preload })` to customize HTML, headers, and asset preloading.
- `handleFetch({ event, request, fetch })`: intercepts server‑side `fetch` calls to rewrite URLs, forward cookies on cross‑origin, or route internal requests directly to handlers.
- `init()`: runs once at server startup for async setup (e.g. database connections).

### Shared hooks

- `handleError({ error, event, status, message })`: catches unexpected runtime errors on server or client; log via Sentry or similar, return a safe object (e.g. `{ message: 'Oops', errorId }`) for `$page.error`.

### Universal hooks

- `reroute({ url, fetch? })`: map incoming `url.pathname` to a different route ID (without changing the address bar), optionally async and using `fetch`.
- `transport`: define `encode`/`decode` for custom types (e.g. class instances) to serialize them across server/client boundaries in loads and actions.

## Errors

- Expected errors thrown with `error(status, message|object)` set the response code, render the nearest `+error.svelte` with `page.error`, and let you pass extra props (e.g. `{ code: 'NOT_FOUND' }`).
- Unexpected exceptions invoke the `handleError` hook, are logged internally, and expose a generic `{ message: 'Internal Error' }` to users; customize reporting or user‑safe messages in `handleError`.
- Errors in server handlers or `handle` return JSON or your `src/error.html` fallback based on `Accept` headers; errors in `load` render component boundaries as usual. Type‑safe shapes via a global `App.Error` interface.

## Link options

- `data-sveltekit-preload-data="hover"|"tap"` preloads `load` on link hover (`touchstart`) or immediate tap; use `"tap"` for fast‑changing data.
- `data-sveltekit-preload-code="eager"|"viewport"|"hover"|"tap"` preloads JS/CSS aggressively or on scroll/hover/tap to improve load times.
- `data-sveltekit-reload` forces full-page reload; `data-sveltekit-replacestate` uses `replaceState`; `data-sveltekit-keepfocus` retains focus; `data-sveltekit-noscroll` preserves scroll position; disable any by setting the value to `"false"`.

## Service workers

- Drop `src/service-worker.js` (or `/service-worker/index.js`) to auto-register a module‑type SW; disable or relocate via `config.kit.files.serviceWorker` or custom registration logic.
- In the SW, import `{ build, files, version }` from `$service-worker`, use unique cache names, cache assets on `install`, purge old caches on `activate`, and intercept `fetch` to serve cached or network resources.
- During dev only modern browsers support module SWs; when manually registering use `{ type: dev ? 'module' : 'classic' }`; enable TypeScript SW typings with triple‑slash refs and casting `self` to `ServiceWorkerGlobalScope`. For richer PWA tooling, consider the Vite PWA plugin.

## Server-only modules

- `$env/static/private` and `$env/dynamic/private` can only be imported into server‑only files (`hooks.server.js`, `+page.server.js`); prevents leaking secrets to the client.
- `$app/server` (e.g. the `read()` API) is likewise restricted to server‑side code.
- Make your own modules server‑only by naming them `*.server.js` or placing them in `src/lib/server/`; any public‑facing import chain to these files triggers a build error.

## Snapshots

- Export a `snapshot` object with `capture()` returning serializable state and `restore(value)` reapplying it; SvelteKit stores this in history entries and `sessionStorage`.
- Captures ephemeral DOM state (form inputs, scroll positions) before navigation and restores on back‑navigation or reload.
- Ensure captured values are JSON‑serializable so they persist correctly across sessions.

## Shallow routing

- Use `pushState(path, state)` or `replaceState('', state)` from `$app/navigation` to create history entries without full navigation; read/write `page.state` from `$app/state`.
- Ideal for UI like modals: `if (page.state.showModal) <Modal/>` and dismiss with `history.back()`.
- To embed a route’s page component without navigation, preload data with `preloadData(href)` then `pushState`, falling back to `goto`; note SSR and initial load have empty `page.state`, and shallow routing requires JS.

## Images

- Vite’s asset handling inlines small files, adds hashes, and lets you `import logo from '...png'` for use in `<img src={logo}>`.
- Install `@sveltejs/enhanced-img` and add `enhancedImages()` to your Vite config; use `<enhanced:img src="...jpg" alt="…"/>` to auto‑generate `<picture>` tags with AVIF/WebP, responsive `srcset`/`sizes`, and intrinsic dimensions.
- For CMS or dynamic images, leverage a CDN with Svelte libraries like `@unpic/svelte`; always supply high‑resolution originals (2×), specify `sizes` for LCP images, set `fetchpriority="high"`, constrain layout via CSS to avoid CLS, and include meaningful `alt` text.

## Reference docs

### Imports from `@sveltejs/kit`

- **VERSION**: the SvelteKit version string

  ```js
  import { VERSION } from '@sveltejs/kit';
  console.log(VERSION); // e.g. "2.20.1"
  ```

- **error**: throw an HTTP error and halt request processing

  ```js
  import { error } from '@sveltejs/kit';
  export function load() {
  	error(404, 'Not found');
  }
  ```

- **fail**: return a form action failure without throwing

  ```js
  import { fail } from '@sveltejs/kit';
  export const actions = {
  	default: async ({ request }) => {
  		const data = await request.formData();
  		if (!data.get('name')) return fail(400, { missing: true });
  	}
  };
  ```

- **isActionFailure**: type‑guard for failures from `fail`

  ```js
  import { isActionFailure } from '@sveltejs/kit';
  if (isActionFailure(result)) {
  	/* handle invalid form */
  }
  ```

- **isHttpError**: type‑guard for errors from `error`

  ```js
  import { isHttpError } from '@sveltejs/kit';
  try {
  	/* … */
  } catch (e) {
  	if (isHttpError(e, 404)) console.log('Not found');
  }
  ```

- **isRedirect**: type‑guard for redirects from `redirect`

  ```js
  import { redirect, isRedirect } from '@sveltejs/kit';
  try {
  	redirect(302, '/login');
  } catch (e) {
  	if (isRedirect(e)) console.log('Redirecting');
  }
  ```

- **json**: build a JSON `Response`

  ```js
  import { json } from '@sveltejs/kit';
  export function GET() {
  	return json({ hello: 'world' });
  }
  ```

- **normalizeUrl** _(v2.18+)_: strip internal suffixes/trailing slashes

  ```js
  import { normalizeUrl } from '@sveltejs/kit';
  const { url, denormalize } = normalizeUrl('/foo/__data.json');
  url.pathname; // /foo
  ```

- **redirect**: throw a redirect response

  ```js
  import { redirect } from '@sveltejs/kit';
  export function load() {
  	redirect(303, '/dashboard');
  }
  ```

- **text**: build a plain‑text `Response`

  ```js
  import { text } from '@sveltejs/kit';
  export function GET() {
  	return text('Hello, text!');
  }
  ```

- **Action**: form action handler type

  ```ts
  type Action = (event: RequestEvent) => Promise<Record<string, any> | void>;
  ```

- **ActionFailure**: object returned by `fail`

  ```ts
  interface ActionFailure<T> {
  	status: number;
  	data: T;
  	[Symbol.for('fail')]: true;
  }
  ```

- **ActionResult**: shape of enhanced form action responses

  ```ts
  type ActionResult =
  	| { type: 'success'; status: number; data?: any }
  	| { type: 'failure'; status: number; data?: any }
  	| { type: 'redirect'; status: number; location: string }
  	| { type: 'error'; status?: number; error: any };
  ```

- **Actions**: record of named `Action`s

  ```ts
  export const actions: Actions = {
  	default: async (event) => {
  		/* … */
  	}
  };
  ```

- **Cookies**: API to get/set/delete HTTP cookies. Available on the request event

  ```ts
  export function load(event) {
  	event.cookies.set('session', token, { path: '/' });
  	const user = event.cookies.get('session');
  }
  ```

- **Handle**: server hook to intercept all requests. Needs to be inside `src/hooks.server.ts`

  ```ts
  export const handle: Handle = async ({ event, resolve }) => {
  	event.locals.user = await getUser(event.cookies.get('sid'));
  	return resolve(event);
  };
  ```

- **HandleFetch**: server hook to modify internal `fetch`. Needs to be inside `src/hooks.server.ts`

  ```ts
  export const handleFetch: HandleFetch = async ({ request, fetch }) => {
  	if (request.url.startsWith(API)) request.headers.set('x-api', 'true');
  	return fetch(request);
  };
  ```

- **HandleServerError**: server hook for uncaught errors. Needs to be inside `src/hooks.server.ts`

  ```ts
  export const handleError: HandleServerError = ({ error }) => {
  	console.error(error);
  	return { message: 'Internal Error' };
  };
  ```

- **HandleClientError**: client hook for uncaught navigation errors. Needs to be inside `src/hooks.client.ts`

  ```ts
  export const handleError: HandleClientError = ({ error }) => {
  	console.error('Client error', error);
  };
  ```

- **Reroute** _(v2.3+)_: universal hook to rewrite paths before routing. Needs to be inside `src/hooks.ts`

  ```ts
  export const reroute: Reroute = ({ url }) => {
  	if (url.pathname === '/home') return '/';
  };
  ```

- **Transport**: transport custom types across server↔client. Needs to be inside `src/hooks.ts`

  ```ts
  export const transport: Transport = {
  	Date: { encode: (d) => d.toISOString(), decode: (s) => new Date(s) }
  };
  ```

- **Load**: generic type for `+page.js`/`+layout.js` `load` functions

  ```ts
  export const load: Load = async ({ params, fetch }) => ({ post: await fetch(...) });
  ```

- **LoadEvent**: argument to universal `load` functions

  ```ts
  export function load({ params, fetch, setHeaders, parent }: LoadEvent) {
  	/* … */
  }
  ```

- **ServerLoad**: generic type for server‑only `load` in `+page.server.js`

  ```ts
  export const load: ServerLoad = async ({ params }) => ({ post: await db.get(params.id) });
  ```

- **ServerLoadEvent**: argument to `+page.server.js` `load`

  ```ts
  export function load({ params, cookies, parent }: ServerLoadEvent) {
  	/* … */
  }
  ```

- **RequestEvent**: argument to endpoints and server `load`/`action`

  ```ts
  export async function POST({ request, cookies, params }: RequestEvent) {
  	/* … */
  }
  ```

- **RequestHandler**: type for `+server.js` verb handlers

  ```ts
  export const GET: RequestHandler = ({ url }) => new Response('ok');
  ```

- **Snapshot**: save/restore ephemeral page or layout state.

  ```svelte
  <script>
    let comment = $state();
    export const snapshot: Snapshot<string> = {
        capture: () => comment,
        restore: v => comment = v
    };
  </script>
  ```

- **SubmitFunction**: parameter to `use:enhance` for progressive forms

  ```svelte
  <form method=post use:enhance={({ formData, submitter }: SubmitFunction) => {
    if (submitter.name === 'save') cancel();
  }}>...</form>
  ```

- **BeforeNavigate**: argument to `beforeNavigate` callbacks

  ```js
  beforeNavigate(({ cancel }: BeforeNavigate) => {
  	if (!confirm('Leave?')) cancel();
  });
  ```

- **AfterNavigate**: argument to `afterNavigate` callbacks

  ```js
  afterNavigate(({ type, to }: AfterNavigate) => console.log('navigated via', type));
  ```

- **OnNavigate**: argument to `onNavigate` callbacks

  ```js
  onNavigate(({ to, delta }: OnNavigate) => console.log('will go to', to));
  ```

- **Navigation**: base shape for navigation events

  ```ts
  interface Navigation {
  	from: NavigationTarget;
  	to: NavigationTarget;
  	type: NavigationType;
  	willUnload: boolean;
  	complete: Promise<void>;
  }
  ```

- **NavigationTarget**: info about before/after navigation pages

  ```ts
  interface NavigationTarget {
  	url: URL;
  	params: Record<string, string>;
  	route: { id: string | null };
  }
  ```

- **NavigationType**: `'enter'|'form'|'link'|'goto'|'popstate'|'leave'`
- **Page**: reactive `page` object shape: `{ url, params, route, status, error, data, state, form }`
- **ParamMatcher**: `(param: string) => boolean` to validate route params
- **PrerenderOption**: `boolean | 'auto'` to control page prerendering
- **Redirect**: object thrown by `redirect()`: `{ status, location }`
- **ResolveOptions**: options for `resolve(event, opts)`: `transformPageChunk`, `filterSerializedResponseHeaders`, `preload`
- **TrailingSlash**: `'never'|'always'|'ignore'` config for URL slashes

### Imports from `@sveltejs/kit/hooks`

- **sequence**: compose multiple `handle` hooks into one, merging their options

  ```js
  import { sequence } from '@sveltejs/kit/hooks';
  export const handle = sequence(handleOne, handleTwo);
  ```

### Imports from `@sveltejs/kit/node/polyfills`

- **installPolyfills**: inject `crypto`, `File`, etc. as globals in Node

  ```js
  import { installPolyfills } from '@sveltejs/kit/node/polyfills';
  installPolyfills();
  ```

### Imports from `@sveltejs/kit/node`

- **createReadableStream** _(v2.4+)_: turn a filesystem path into a `ReadableStream`

  ```js
  import { createReadableStream } from '@sveltejs/kit/node';
  const stream = createReadableStream('/path/to/file.txt');
  ```

- **getRequest**: adapt Node’s `IncomingMessage` to a Fetch `Request`

  ```js
  import { getRequest } from '@sveltejs/kit/node';
  const request = await getRequest({ request: req, base: '/app' });
  ```

- **setResponse**: write a Fetch `Response` back to Node’s `ServerResponse`

  ```js
  import { setResponse } from '@sveltejs/kit/node';

  function nodeMiddleware(req, res) {
    const response = doSomething(req);
    await setResponse(res, response);
  }
  ```

### Imports from `@sveltejs/kit/node`

- **sveltekit**: Vite plugin factory for SvelteKit integration

  ```js
  // vite.config.js
  import { defineConfig } from 'vite';
  import { sveltekit } from '@sveltejs/kit/vite';
  export default defineConfig({ plugins: [sveltekit()] });
  ```

### Imports from `$app/environment`

- **browser**: `true` when code runs in the browser

  ```js
  import { browser } from '$app/environment';
  console.log(browser); // false during SSR
  ```

- **building**: `true` during build or prerendering phases

  ```js
  import { building } from '$app/environment';
  if (!building) {
  	/* runtime‑only code */
  }
  ```

- **dev**: `true` when running via the dev server

  ```js
  import { dev } from '$app/environment';
  console.log(dev); // true in `npm run dev`
  ```

- **version**: the `config.kit.version.name` value

  ```js
  import { version } from '$app/environment';
  console.log(version); // e.g. "1.0.0"
  ```

### Imports from `$app/forms`

- **applyAction**: apply an `ActionResult` to update `page.form` and `page.status`

  ```js
  import { applyAction } from '$app/forms';
  // inside enhance callback:
  await applyAction(result);
  ```

- **deserialize**: parse a serialized form action response back into `ActionResult`

  ```js
  import { deserialize } from '$app/forms';
  const result = deserialize(await response.text());
  ```

- **enhance**: progressively enhance a `<form>` for AJAX submissions

  ```svelte
  <script>
    import { enhance } from '$app/forms';
  </script>
  <form use:enhance on:submit={handle}>
  ```

### Imports from `$app/navigation`

- **afterNavigate**: run code after every client‑side navigation. Needs to be called at component initialization

  ```js
  import { afterNavigate } from '$app/navigation';
  afterNavigate(({ type, to }) => console.log('navigated via', type));
  ```

- **beforeNavigate**: intercept and optionally cancel upcoming navigations. Needs to be called at component initialization

  ```js
  import { beforeNavigate } from '$app/navigation';
  beforeNavigate(({ cancel }) => {
  	if (!confirm('Leave?')) cancel();
  });
  ```

- **disableScrollHandling**: disable automatic scroll resetting after navigation

  ```js
  import { disableScrollHandling } from '$app/navigation';
  disableScrollHandling();
  ```

- **goto**: programmatically navigate within the app

  ```svelte
  <script>
    import { goto } from '$app/navigation';
    function navigate() {
      goto('/dashboard', { replaceState: true });
    }
  </script>
    <button onclick={navigate}>navigate</button>
  ```

- **invalidate**: re‑run `load` functions that depend on a given URL or custom key

  ```js
  import { invalidate } from '$app/navigation';
  await invalidate('/api/posts');
  ```

- **invalidateAll**: re‑run every `load` for the current page

  ```js
  import { invalidateAll } from '$app/navigation';
  await invalidateAll();
  ```

- **onNavigate**: hook invoked immediately before client‑side navigations. Needs to be called at component initialization

  ```js
  import { onNavigate } from '$app/navigation';
  onNavigate(({ to }) => console.log('about to go to', to.url));
  ```

- **preloadCode**: import route modules ahead of navigation (no data fetch)

  ```js
  import { preloadCode } from '$app/navigation';
  await preloadCode('/about');
  ```

- **preloadData**: load both code and data for a route ahead of navigation

  ```js
  import { preloadData } from '$app/navigation';
  const result = await preloadData('/posts/1');
  ```

- **pushState**: create a shallow‑routing history entry with custom state

  ```js
  import { pushState } from '$app/navigation';
  pushState('', { modalOpen: true });
  ```

- **replaceState**: replace the current history entry with new custom state

  ```js
  import { replaceState } from '$app/navigation';
  replaceState('', { modalOpen: false });
  ```

### Imports from `$app/paths`

- **assets**: the absolute URL prefix for static assets (`config.kit.paths.assets`)

  ```js
  import { assets } from '$app/paths';
  console.log(`<img src="${assets}/logo.png">`);
  ```

- **base**: the base path for your app (`config.kit.paths.base`)

  ```svelte
  <a href="{base}/about">About Us</a>
  ```

- **resolveRoute**: interpolate a route ID with parameters to form a pathname

  ```js
  import { resolveRoute } from '$app/paths';
  resolveRoute('/blog/[slug]/[...rest]', {
  	slug: 'hello',
  	rest: '2024/updates'
  });
  // → "/blog/hello/2024/updates"
  ```

### Imports from `$app/server`

- **getRequestEvent** _(v2.20+)_: retrieve the current server `RequestEvent`

  ```js
  import { getRequestEvent } from '$app/server';
  export function load() {
  	const event = getRequestEvent();
  	console.log(event.url);
  }
  ```

- **read** _(v2.4+)_: read a static asset imported by Vite as a `Response`

  ```js
  import { read } from '$app/server';
  import fileUrl from './data.txt';
  const res = read(fileUrl);
  console.log(await res.text());
  ```

- **navigating**: a read‑only object describing any in‑flight navigation (or `null`)

  ```svelte
  <script>
    import { navigating } from '$app/state';
    console.log(navigating.from, navigating.to);
  </script>
  ```

### Imports from `$app/state`

- **page**: read‑only reactive info about the current page (`url`, `params`, `data`, etc.)

  ```svelte
  <script>
    import { page } from '$app/state';
    const path = $derived(page.url.pathname);
  </script>
  {path}
  ```

- **updated**: reactive flag for new app versions; call `updated.check()` to poll immediately

  ```svelte
  <script>
    import { updated } from '$app/state';
    $effect(() => {
      if (updated.current) {
        alert('A new version is available. Refresh?');
      }
    })
  </script>
  ```

### Imports from `$env/dynamic/private`

- **env (dynamic/private)**: runtime private env vars (`process.env…`), not exposed to client

  ```js
  import { env } from '$env/dynamic/private';
  console.log(env.SECRET_API_KEY);
  ```

### Imports from `$env/dynamic/public`

- **env (dynamic/public)**: runtime public env vars (`PUBLIC_…`), safe for client use

  ```js
  import { env } from '$env/dynamic/public';
  console.log(env.PUBLIC_BASE_URL);
  ```

### Imports from `$env/static/private`

- **$env/static/private**: compile‑time private env vars, dead‑code eliminated

  ```js
  import { DATABASE_URL } from '$env/static/private';
  console.log(DATABASE_URL);
  ```

### Imports from `$env/static/public`

- **$env/static/public**: compile‑time public env vars (`PUBLIC_…`), safe on client

  ```js
  import { PUBLIC_WS_ENDPOINT } from '$env/static/public';
  console.log(PUBLIC_WS_ENDPOINT);
  ```

### `$lib` alias

- **$lib**: alias for `src/lib`, e.g.

  ```svelte
  <script>
    import Button from '$lib/Button.svelte';
  </script>
  <Button>Click me</Button>
  ```

### Imports from `$service-worker`

- **base** _(service worker)_: deployment base path, derived from `location.pathname`

  ```js
  import { base } from '$service-worker';
  console.log(`cache.addAll(${base}/build/${filename})`);
  ```

- **build**: array of Vite‑generated asset URLs for precaching

  ```js
  import { build } from '$service-worker';
  caches.open(`v${version}`).then((c) => c.addAll(build));
  ```

- **files**: array of URLs for `static` (or `config.kit.files.assets`) directory

  ```js
  import { files } from '$service-worker';
  files.forEach((url) => console.log('static asset:', url));
  ```

- **prerendered**: list of prerendered pathnames for offline support

  ```js
  import { prerendered } from '$service-worker';
  console.log(prerendered);
  ```

- **version**: app version string (`config.kit.version.name`), used for cache‑busting
  ```js
  import { version } from '$service-worker';
  const cacheName = `cache-v${version}`;
  ```
