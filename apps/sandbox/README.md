# sandbox

A static host for the svelte.dev tutorial sandbox. It's deployed to `*.svelte-sandbox.link`. Each tutorial session uses a random subdomain, so tabs don't share a service worker.

It only contains two files that matter:

- `public/__sandbox/relay.html`: embedded invisibly by the tutorial page. It registers the service worker and starts the sandbox worker. The worker's code is loaded from the svelte.dev deployment that embeds the relay, so this app doesn't need redeploying when svelte.dev changes.
- `public/__sandbox_sw.js`: forwards requests from the preview iframe to the sandbox worker.

Both should stay small and generic. If you make an incompatible change to how they talk to the tutorial page or the worker, bump `VERSION` in `relay.html` and in `apps/svelte.dev/src/lib/tutorial/adapters/sandbox/index.svelte.ts`. The relay only accepts parents from an allowlist of origins, and only loads workers from the parent's own origin.

See `apps/svelte.dev/src/lib/tutorial/adapters/sandbox/README.md` for how the whole thing works.

## Deployment

This is the `svelte-sandbox` Vercel project in the `svelte` team:

- Framework preset: Other, with no build or install step (see `vercel.json`)
- Domains: `svelte-sandbox.link` and `*.svelte-sandbox.link`. The domain is registered with Vercel and uses Vercel's nameservers, which wildcard domains require.
- Deployment protection applies to everything except custom domains, so the `*.vercel.app` URLs need a login, but `*.svelte-sandbox.link` is public.
- **It isn't connected to Git, and it's deployed manually**:

  ```sh
  cd apps/sandbox
  vc link --project svelte-sandbox --scope svelte  # once
  vc deploy --prod --scope svelte
  ```

  This is deliberate. A Git-connected monorepo project needs its Root Directory set to `apps/sandbox`. Vercel checks that the directory exists before running any ignore step, so every push to a branch that doesn't contain `apps/sandbox` fails with a red check: `main`, `next`, older PRs and the automated `preview-kit-*` branches. The app is two small files that rarely change, and changes are protocol-sensitive anyway, so an explicit deploy is no great loss. Once `apps/sandbox` has been on `main` long enough that stale branches don't matter, we could revisit this: connect Git, set the root directory, and enable "skip unaffected projects".

svelte.dev deployments (production, `next.svelte.dev` and previews) all use the _production_ sandbox, so a deploy affects all of them. Keep changes backwards-compatible where possible. Otherwise, bump `VERSION`, and remember that older svelte.dev deployments will stop working with the new sandbox.

`svelte-sandbox.link` is deliberately a different site from `svelte.dev`. If it were a subdomain like `sandbox.svelte.dev`, user code would be same-site with svelte.dev, and could make requests that carry svelte.dev's `SameSite` cookies.

### Which sites can use the sandbox

The relay checks the embedding page's origin against an allowlist in `relay.html`:

- `svelte.dev` and `next.svelte.dev`
- deployments of the `svelte-dev` and `next-svelte-dev` projects (`svelte-<hash>-svelte.vercel.app`, `next-svelte-<hash>-svelte.vercel.app`) and their branch aliases (`svelte-dev-git-<branch>-svelte.vercel.app`, etc.)
- localhost

Previews of `next-svelte-dev` have Vercel deployment protection. The sandbox loads its worker from the embedding deployment without credentials, so the sandbox won't work on those preview URLs, although `next.svelte.dev` itself is fine. `svelte-dev` previews are unprotected and work.

## Local development

There's no separate dev server. The svelte.dev dev server (and `vite preview`) serves `public/` on `*.localhost` hosts, using the headers from `vercel.json`. See the `tutorial-sandbox` plugin in `apps/svelte.dev/vite.config.ts`.
