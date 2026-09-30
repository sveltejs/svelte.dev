# sandbox

A static host for the svelte.dev tutorial sandbox. It's deployed to `*.svelte-sandbox.link`. Each tutorial session uses a random subdomain, so tabs don't share a service worker.

It only contains two files that matter:

- `public/__sandbox/relay.html`: embedded invisibly by the tutorial page. It registers the service worker and starts the sandbox worker. The worker's code is loaded from the svelte.dev deployment that embeds the relay, so this app doesn't need redeploying when svelte.dev changes.
- `public/__sandbox_sw.js`: forwards requests from the preview iframe to the sandbox worker.

Both should stay small and generic. If you make an incompatible change to how they talk to the tutorial page or the worker, bump `VERSION` in `relay.html` and in `apps/svelte.dev/src/lib/tutorial/adapters/sandbox/index.svelte.ts`. The relay only accepts parents from an allowlist of origins, and only loads workers from the parent's own origin.

See `apps/svelte.dev/src/lib/tutorial/adapters/sandbox/README.md` for how the whole thing works.

## Deployment

This is a separate Vercel project:

- Root directory: `apps/sandbox`
- Framework preset: Other
- No build step (see `vercel.json`)
- Domains: `svelte-sandbox.link` and `*.svelte-sandbox.link`. Wildcard domains on Vercel require the domain to use Vercel's nameservers.

`svelte-sandbox.link` is deliberately a different site from `svelte.dev`. If it were a subdomain like `sandbox.svelte.dev`, user code would be same-site with svelte.dev, and could make requests that carry svelte.dev's `SameSite` cookies.

## Local development

There's no separate dev server. The svelte.dev dev server (and `vite preview`) serves `public/` on `*.localhost` hosts, using the headers from `vercel.json`. See the `tutorial-sandbox` plugin in `apps/svelte.dev/vite.config.ts`.
