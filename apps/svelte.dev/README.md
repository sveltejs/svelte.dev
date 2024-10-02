# svelte.dev

This is the app behind svelte.dev, the official Svelte site.

## Development

### Tutorial

The tutorial consists of two technically different parts: The Svelte tutorial and the SvelteKit tutorial. The SvelteKit tutorial uses Stackblitz WebContainers under the hood in order to boot up a Node runtime in the browser. The Svelte tutorial uses Rollup in a web worker - it does not use WebContainers because a simple web worker is both faster and more reliable (there are known issues with iOS mobile).

WebContainers make use of certain features that are only available when certain security-related cors headers are set, namely these two:

```
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```

Because we're doing soft navigation between pages, these headers need to be set for all responses, not just the ones from `/tutorial`.

The result of setting these headers is that the site can no longer embed URLs from other sites (like images from another domain) without those domains either having a `cross-origin-resource-policy: cross-origin` header (which most don't) or us adding the `crossorigin="anonymous"` attribute to the elements that load those URLs.

When writing content for the tutorial, you need to be aware of the differences of loading content:

- When using content like images for the Svelte tutorial, either place them in the `static/tutorial` folder, or if it's from a different domain, add the `crossorigin` attribute
- When using content like images for the SvelteKit tutorial, either place them into a `static` folder right in that chapter and reference them, or import them like you can do when using Vite (e.g. `import Svg from './some.svg';`)
