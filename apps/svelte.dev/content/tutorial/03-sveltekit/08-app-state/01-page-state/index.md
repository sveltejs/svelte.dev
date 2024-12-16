---
title: page
---

SvelteKit makes three readonly state objects available via the `$app/state` module — `page`, `navigating` and `updated`. The one you'll use most often is [`page`](/docs/kit/@sveltejs-kit#Page), which provides information about the current page:

- `url` — the [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL) of the current page
- `params` — the current page's [parameters](params)
- `route` — an object with an `id` property representing the current route
- `status` — the HTTP status code of the current page
- `error` — the error object of the current page, if any (you'll learn more about error handling in [later](error-basics) [exercises](handleerror))
- `data` — the data for the current page, combining the return values of all `load` functions
- `form` — the data returned from a [form action](the-form-element)

Each of these properties is reactive, using `$state.raw` under the hood. Here's an example using `page.url.pathname`:

```svelte
/// file: src/routes/+layout.svelte
<script>
	+++import { page } from '$app/state';+++

	let { children } = $props();
</script>

<nav>
	<a href="/" +++aria-current={page.url.pathname === '/'}+++>
		home
	</a>

	<a href="/about" +++aria-current={page.url.pathname === '/about'}+++>
		about
	</a>
</nav>

{@render children()}
```

> [!NOTE] Prior to SvelteKit 2.12, you had to use `$app/stores` for this, which provides a `$page` store with the same information. If you're currently using `$app/stores`, we advise you to migrate towards `$app/state` (requires Svelte 5).
