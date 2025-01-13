# svelte.dev

This is the app behind [svelte.dev](https://svelte.dev), the official Svelte site.

## Documentation PRs

If you're creating a documentation PR, make sure you're targeting the right repository. More specifically, changes to content within `apps/svelte.dev/content/docs` are synced from other repositories, and documentation changes within those folder should therefore be made in those repositories:

- `docs/svelte` -> https://github.com/sveltejs/svelte
- `docs/kit` -> https://github.com/sveltejs/kit
- `docs/cli` -> https://github.com/sveltejs/cli

The tutorial, blog and examples are maintained within this repository.

## Development

### Tutorial

The tutorial consists of two technically different parts: The Svelte tutorial and the SvelteKit tutorial. The SvelteKit tutorial uses [WebContainers](https://webcontainers.io/) under the hood in order to boot up a Node runtime in the browser. The Svelte tutorial uses Rollup in a web worker - it does not use WebContainers because a simple web worker is both faster and more reliable (there are known issues with iOS mobile).

WebContainers require [cross-origin isolation](https://webcontainers.io/guides/quickstart#cross-origin-isolation), which means the document needs to have these headers:

```
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```

The result of setting these headers is that the site can no longer embed URLs from other sites (like images from another domain) without those domains either having a `cross-origin-resource-policy: cross-origin` header (which most don't) or us adding the `crossorigin="anonymous"` attribute (or the experimental-only-working-in-chrome `credentialless` for iframes) to the elements that load those URLs. For this reason, navigations between the SvelteKit tutorial and other pages (and vice versa) are full page navigations so the headers don't interfere with the rest of the page.

When writing content for the tutorial, you need to be aware of the differences of loading content:

- When using root-relative paths, for a SvelteKit exercise the 'root' is the `static` directory inside the exercise itself, but for a Svelte exercise it is the root of the app so assets should do inside `apps/svelte.dev/static/tutorial`.
- When importing relative assets in a Svelte exercise, Rollup inlines them into the bundle as base64

### Dependencies

If you look in the site's package.json you'll notice several dependencies that don't appear to be used, such as `@testing-library/svelte`. These are present because they're referenced in the docs, and Twoslash needs to be able to find type definitions in order to typecheck snippets. Installing the dependencies was deemed preferable to faking it with `declare module`, since we're liable to end up with fictional types that way.

### Prerendering

Most of the site is prerendered. Since that involves some fairly expensive work, it can take a while. To build the site _without_ prerendering — for example, because you need to debug an issue that's affecting production builds — set the `PRERENDER` environment variable to `false`:

```bash
PRERENDER=false pnpm build
```
