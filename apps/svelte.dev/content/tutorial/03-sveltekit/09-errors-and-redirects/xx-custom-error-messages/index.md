---
title: Customizing the error message
---

The error page in the previous exercise is rather static. Maybe you want to show the error message so you can help people turning up in your support channels faster.

For this, SvelteKit provides you with `page.error` and `page.status`, which contain information about the error and the status code. Let's add it to `+error.svelte`:

```svelte
/// file: src/routes/+error.svelte
<script>
	+++import { page } from '$app/state';+++

	let online = typeof navigator !== 'undefined'
		? navigator.onLine
		: true;
</script>

+++{#if page.status === 404}
	<h1>Not found</h1>
{:else +++if !online}
	<h1>You're offline</h1>
{:else}
	<h1>Oops!</h1>
	---<p>Something went wrong</p>---
	+++<p>{page.error.message}</p>+++
{/if}
```

That's better, but `page.error.message` always contains "Internal Error" - how so? This is because SvelteKit plays it safe and prevents you from accidentally showing sensitive information as part of the error message.

To customize it, implement the `handleError` hook in `hooks.server.js` and `hooks.client.js`. These hooks run for every error during loading or rendering, and the `kind` property lets us identify unexpected errors thrown by our code:

```js
// hooks.server.js
export function handleError(+++{ kind, error }+++) {
    +++if (kind === 'unknown') {
        return { message: error instanceof Error ? error.message : 'Internal Error' };
    }+++
}
```

```js
// hooks.client.js
export function handleError(+++{ kind, error }+++) {
    +++if (kind === 'unknown') {
        return { message: error instanceof Error ? error.message : 'Internal Error' };
    }+++
}
```

Returning nothing for other error kinds preserves SvelteKit's safe default. You could also call your error reporting service for unexpected errors in these hooks.

Note that you can return more than an error message if you like. Whatever object shape you return will be available in `page.error`, and you can return `status` or `message` to override their defaults. You can read more about this (and how to make it type-safe!) in the [error docs](/docs/kit/errors).

> [!NOTE] When handling errors, be careful to not assume it's an `Error` object, anything could be thrown. Also make sure not to expose sensitive data by forwarding too much information
