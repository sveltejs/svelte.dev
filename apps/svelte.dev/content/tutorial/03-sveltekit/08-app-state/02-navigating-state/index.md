---
title: navigating
---

The `navigating` state represents the current navigation. When a navigation starts — because of a link click, or a back/forward navigation, or a programmatic `goto` — the value of `navigating.current` will become an object with the following properties:

- `from` and `to` — objects with `params`, `route` and `url` properties
- `type` — the type of navigation, e.g. `link`, `popstate` or `goto`

> [!NOTE] For complete type information visit the [`Navigation`](/docs/kit/@sveltejs-kit#Navigation) documentation.

It can be used to show a loading indicator for long-running navigations. In this exercise, `src/routes/+page.server.js` and `src/routes/about/+page.server.js` both have an artificial delay. Inside `src/routes/+layout.svelte`, import the `navigating` state and add a message to the nav bar:

```svelte
/// file: src/routes/+layout.svelte
<script>
	import { page, +++navigating+++ } from '$app/state';

	let { children } = $props();
</script>

<nav>
	<a href="/" aria-current={page.url.pathname === '/'}>
		home
	</a>

	<a href="/about" aria-current={page.url.pathname === '/about'}>
		about
	</a>

+++	{#if navigating.current}
		navigating to {navigating.current.to.url.pathname}
	{/if}+++
</nav>

{@render children()}
```

> [!NOTE] Prior to SvelteKit 2.12, you had to use `$app/stores` for this, which provides a `$navigating` store with the same information. If you're currently using `$app/stores`, we advice you do migrate towards `$app/state` (requires Svelte 5).
