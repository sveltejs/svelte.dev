---
title: Customising the error message
---

The error page in the previous exercise is rather static. Maybe you want to show the error message so you can help people turning up in your support channels faster.

For this, SvelteKit provides you with `page.error` (which contains the error's `status`, `message` and any custom properties), as well as `page.status`. Let's add them to `+error.svelte`:

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

That's better, but the unknown error on the about page has the message "Internal Error" - how so? This is because SvelteKit plays it safe and prevents you from accidentally showing sensitive information as part of the error message.

To customize it, implement the `handleError` hook in `hooks.server.js` and `hooks.client.js`. These hooks receive every error thrown while loading, rendering or responding to a request; the property `kind` tells you where each error came from. We only want to reveal the original message for `'unknown'` errors. Returning nothing for `'app'`, `'framework'` and server-side `'validation'` errors preserves their existing safe details.

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

You could also call your error reporting service in these hooks.

Note that you can return more properties if you like. Whatever object shape you return will be merged with the defaults and available in `page.error`. Returning a `status` also changes the status used to render the error page. You can read more about this (and how to make it type-safe!) in the [error docs](/docs/kit/errors).

> [!NOTE] When handling errors, be careful to not assume it's an `Error` object, anything could be thrown. Also make sure not to expose sensitive data by forwarding too much information
