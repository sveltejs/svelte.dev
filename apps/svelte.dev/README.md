# svelte.dev

This is the app behind [svelte.dev](https://svelte.dev), the official Svelte site.

## Development

### Tutorial

The tutorial consists of two technically different parts: The Svelte tutorial and the SvelteKit tutorial. The SvelteKit tutorial uses [WebContainers](https://webcontainers.io/) under the hood in order to boot up a Node runtime in the browser. The Svelte tutorial uses Rollup in a web worker - it does not use WebContainers because a simple web worker is both faster and more reliable (there are known issues with iOS mobile).

WebContainers require [cross-origin isolation](https://webcontainers.io/guides/quickstart#cross-origin-isolation), which means the document needs to have these headers:

```
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```

Because we're doing soft navigation between pages, these headers need to be set for all responses, not just the ones from `/tutorial`.

The result of setting these headers is that the site can no longer embed URLs from other sites (like images from another domain) without those domains either having a `cross-origin-resource-policy: cross-origin` header (which most don't) or us adding the `crossorigin="anonymous"` attribute to the elements that load those URLs.

When writing content for the tutorial, you need to be aware of the differences of loading content:

- When using root-relative paths, for a SvelteKit exercise the 'root' is the `static` directory inside the exercise itself, but for a Svelte exercise it is the root of the app so assets should do inside `apps/svelte.dev/static/tutorial`.
- When importing relative assets in a Svelte exercise, Rollup inlines them into the bundle as base64
