# Tutorial sandbox (WebContainer alternative)

This is an experimental replacement for the WebContainer adapter used by the SvelteKit parts of the tutorial. It runs a subset of the SvelteKit dev server in the browser. It needs no Node emulation, no Vite and no `common.zip`.

It's enabled by default on this branch. Toggle it with `?adapter=webcontainer` or `?adapter=sandbox`, which is persisted to `localStorage` as `sv:tutorial-adapter` (see `src/routes/tutorial/[...slug]/adapter.svelte.ts`).

## Status

All 50 exercises in `03-sveltekit` and `04-advanced-sveltekit` render correctly in both their initial and solved states. The following were checked interactively:

- client-side and server-side navigation
- redirects, both on the server and during client navigation
- `cookies`, including route-group auth with login/logout
- form actions with and without `use:enhance`, including the CSRF origin check
- `+server.js` handlers
- `handle` hooks (`/ping`)
- error pages and `handleError`
- page options: `ssr`, `csr`, `prerender`, `trailingSlash`
- `$app/env/private` / `$app/env/public` with `.env` and `src/env.js`
- param matchers, optional and rest params, `+page@.svelte`
- `vite.config.js` changes, such as the `updated-state` exercise

Hot updates:

- Genuine HMR works for `.svelte` files: the component is swapped with no iframe reload.
- Other modules, and anything server-only, cause a full reload. Vite and SvelteKit do the same.
- Compile errors show in an overlay.

Performance: on a warm cache, the preview renders about 0.6–0.9s after the tutorial page loads, and switching exercises is near-instant. The payload is roughly:

- `packages.json`: 1.5MB (≈375KB gzipped)
- `svelte-compiler.txt`: 850KB (≈250KB gzipped)
- the worker: 330KB

For comparison, `common.zip` is 18.8MB, before counting the WebContainer runtime.

`.ts` files are stripped using `@sveltejs/repl/typescript`, and `<script lang="ts">` is handled by the compiler. The tutorial doesn't need either, but the playground would.

## Architecture

```
tutorial page (svelte.dev, or a preview deployment)
 ├─ <iframe hidden> relay        https://<session>.svelte-sandbox.link/__sandbox/relay.html
 │    ├─ registers service worker   /__sandbox_sw.js (scope /)
 │    └─ creates Worker             blob: → import "https://svelte.dev/_app/immutable/workers/…"  ← the "dev server"
 └─ <iframe> preview             https://<session>.svelte-sandbox.link/<path>
```

The relay and service worker live in a separate app, `apps/sandbox`, deployed to `*.svelte-sandbox.link`. The worker and its assets come from whichever svelte.dev deployment embeds the relay. That way the sandbox app is stable, and preview deployments of svelte.dev bring their own worker.

- **Separate origin, one per session.** The preview has to own `/` because tutorial code uses root-relative URLs. It also needs its own origin for isolation. Each page load picks a random subdomain, so tabs don't share a service worker or BroadcastChannel. The relay unregisters its service worker on `pagehide`. In prod this is `https://<id>.svelte-sandbox.link`. In dev it's `http://<id>.localhost:<port>`: browsers resolve `*.localhost` to loopback, Vite allows it, and the `tutorial-sandbox` plugin in `vite.config.ts` serves `apps/sandbox/public` on those hosts. So there's still only one dev server.
- **Service worker** (`apps/sandbox/public/__sandbox_sw.js`) forwards these to the relay, then the worker, over a MessagePort:
  - every navigation
  - every request from preview clients
  - every `/@ssr/*` request

  Requests from the relay and the worker (the worker's own code in dev, external fetches) go to the network.

- **Relay** (`apps/sandbox/public/__sandbox/relay.html`) registers the service worker and creates the worker. The worker is a same-origin `blob:` module that imports the real worker script from the embedding deployment. It's still controlled by the service worker, which it needs in order to load server modules. The relay hands the worker a MessagePort from the tutorial page, so after that the page talks to the worker directly. The relay also:
  - only runs for parents on an allowlist: svelte.dev, `*.svelte.dev`, `*-svelte.vercel.app` previews and localhost
  - only loads workers from the parent's own origin
  - checks a protocol `VERSION` that the tutorial page sends. Bump it on both sides for incompatible changes.

  The worker files on svelte.dev are served with `access-control-allow-origin: *` (see `vercel.ts`).

- **Worker** (`worker/`):
  - `index.ts`:
    - file sync (`reset`/`update`) and HMR decisions
    - request routing: static assets, then client modules, then raw files, then SvelteKit
    - a cookie jar
    - log forwarding
  - `resolve.ts`: a node-style resolver over the in-memory filesystem. It handles `exports`/`imports` with conditions (`browser`, `development`, `import`, `default`), the `$app`, `$env` and `<sveltekit:generated>` aliases, extension probing, and the virtual `vite` and `@sveltejs/kit/vite` modules. The latter are used to read the kit config out of `vite.config.js`.
  - `modules.ts`: two module graphs (client and server) that transform files:
    - `.svelte`: compiled with `css: 'injected'` and HMR on the client
    - `.svelte.js`: compiled as a module
    - `.ts`: types stripped
    - `.json`
    - `.css`: turned into a style-injecting module on the client
    - assets, `?raw` and `?url`
    - the `__SVELTEKIT_*__` defines

    Imports are rewritten with `es-module-lexer` to versioned URLs (`?v=N`). Invalidation bumps versions: on the server it propagates to all importers, so they get re-evaluated. On the client it follows HMR boundaries.

  - `kit.ts`: a port of `@sveltejs/kit/src/exports/vite/dev/index.js`, covering config, env, manifest generation and the SSR manifest, followed by `new Server(manifest).respond(request)`. **Server modules are loaded with native `import()`** of `/@ssr/...` URLs. Those requests go worker → service worker → relay → worker, so ESM semantics come for free: cycles, live bindings, errors. There is no custom module runner.
  - `patch.ts`: browsers silently drop "forbidden" headers (`cookie`, `origin`, `set-cookie`) from `Request`/`Response`. Inside the worker these are subclassed so that `headers` is an unguarded `Headers` object. Real cookies are never set, because the worker keeps its own jar.
  - `client.js`: served as `/@sandbox/client.js`. It implements `import.meta.hot` (accept, dispose, prune, on and `vite:beforeUpdate`) and the error overlay. It receives messages over `BroadcastChannel('sandbox-hmr')`.

- **Build step** (`scripts/create-tutorial-sandbox/`) writes to `generated/` (gitignored):
  - `packages.json`: the runtime files of `svelte`, `@sveltejs/kit`, `devalue`, `esm-env`, `cookie` and `clsx`, taken from `scripts/create-tutorial-zip/common/node_modules`, so the versions match the WebContainer setup.
  - `kit-node.js`: SvelteKit's _node-side_ code, bundled with esbuild and with `node:fs`, `node:path` etc. replaced by an in-memory FS (`shims/`). It includes `create_manifest_data`, `write_client_manifest`, `write_server`, `create_env_modules`, config validation and the static analysis of page options. **We reuse SvelteKit's own routing and manifest logic rather than reimplementing it.** This `fs` is also the worker's virtual filesystem.
  - `svelte-compiler.txt`: the UMD compiler, `eval`ed in the worker. It has a `.txt` extension so that svelte-check leaves it alone.

## Known gaps and TODOs

- **Deployment.** `apps/sandbox` needs a Vercel project with `svelte-sandbox.link` and `*.svelte-sandbox.link` (see `apps/sandbox/README.md`). Wildcard domains require Vercel's nameservers. Until that exists, the sandbox only works locally.
- **Allowlist.** `*-svelte.vercel.app` is a loose match for preview deployments. It could be tightened to the actual project names, `svelte-*` and `next-svelte-*`.
- **Cross-origin isolation.** The tutorial page is only COOP/COEP-isolated for WebContainers. While that's still the case, the relay, the worker scripts and every service-worker response have to carry COEP/CORP headers. That is why `vite.config.ts`, `vercel.ts` and `apps/sandbox/vercel.json` set them, and `__sandbox_sw.js` adds them itself. Once WebContainers are gone, all of it can be removed.
- **Browser coverage.** Only headless Chrome has been tested. Still to test:
  - Firefox
  - Safari, and especially iOS, where WebContainers don't work at all
  - browsers that block third-party storage: the relay needs a service worker in a third-party iframe. This is a similar constraint to WebContainers, and `Loading.svelte`'s messaging still applies.

  Safari may not resolve `*.localhost` in dev.

- **Kit version coupling.** `kit.ts` mirrors the internals of a specific Kit version (3.0.0-next.25): `new Server(manifest)`, the `set_*` helpers, the define list and the manifest shape. Newer Kit versions (next.29 in the monorepo) have already changed this. For example, `configure()` replaces `new Server()`. Bumping Kit means re-porting `dev/index.js`. Ideally Kit would expose a small, stable "dev server core" that doesn't depend on Vite.
- **Streaming.** Response bodies are buffered (`arrayBuffer()`) before they're sent back through the service worker, so streamed promises from `load` arrive all at once. Transferable `ReadableStream`s would fix this where supported.
- **HMR.** `import.meta.hot.accept(deps, cb)` isn't implemented; only self-accepting modules are. SSR styles for global `.css` imports are collected via `inline_styles`, but that path hasn't been exercised.
- **Not implemented:**
  - remote functions
  - service workers inside the preview
  - `instrumentation.server.js`
  - `svelte.config.js` (irrelevant in Kit 3)
  - non-literal dynamic `import(x)`, which is left untouched
  - CommonJS dependencies
  - installing arbitrary npm packages. The playground would need this; the REPL's npm-fetching code could be reused.
- **Console noise.** Client compile warnings go to the terminal pane. Server ones are dropped to avoid duplicates. There is no per-request logging.
- **Address bar.** The URL bar doesn't update after server-side redirects. This is inherited behaviour from `__client.js`.

## Debugging tips

- `node --experimental-strip-types` can import `worker/modules.ts` and `generated/kit-node.js` directly. Write the package files into `vfs` and call `new ModuleGraph('server').load(id, …)` to test transforms outside the browser. Remember to `eval` the compiler.
- Worker `console.*` output shows up in the tutorial's terminal pane.
- agent-browser's `snapshot` reads inside the cross-origin preview iframe. `eval` and `frame` can't reach it.
