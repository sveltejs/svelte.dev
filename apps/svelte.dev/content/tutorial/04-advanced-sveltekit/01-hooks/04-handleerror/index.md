---
title: handleError
---

The `handleError` hook lets you intercept errors and trigger some behaviour, like pinging a Slack channel or sending data to an error logging service.

As you'll recall from an [earlier exercise](error-basics), an error is _unknown_ if it wasn't created with the `error` helper from `@sveltejs/kit`. It generally means something in your app needs fixing.

Every error is passed to `handleError`. The `kind` property tells you whether it came from your app via `error(...)` (`'app'`), from SvelteKit (`'framework'`), from remote function validation (`'validation'`, on the server only), or from an unknown source (`'unknown'`). The default behavior is to log unknown errors:

```js
/// file: src/hooks.server.js
export function handleError({ kind, error }) {
	if (kind === 'unknown') {
		console.error(error);
	}
}
```

If you navigate to `/the-bad-place`, you'll see this in action — the error page is shown, and if you open the terminal (using the button to the right of the URL bar), you'll see the message from `src/routes/the-bad-place/+page.server.js`.

Notice that we're _not_ showing the error message to the user. That's because error messages can include sensitive information that at best will confuse your users, and at worst could benefit evildoers. Instead, the [`App.Error`](/docs/kit/types#Error) object available to your application — represented as `page.error` in your `+error.svelte` pages, or `%sveltekit.error%` in your `src/error.html` fallback — is just this for unknown errors:

<!-- prettier-ignore-start -->
```js
{
	status: 500,
	message: 'Internal Error'
}
```
<!-- prettier-ignore-end -->

In some situations you may want to customise this object. To do so, you can return an object from `handleError` for `unknown` errors:

```js
/// file: src/hooks.server.js
export function handleError({ kind, error }) {
	if (kind === 'unknown') {
		console.error(error);

		+++return {
			message: 'everything is fine',
			code: 'JEREMYBEARIMY'
		};+++
	}
}
```

Because `status` is omitted, it keeps its default value of `500`. You can return a different `status` if you want to change the status used to render the error page.

For app, framework and validation errors, returning nothing from `handleError` preserves their existing safe `status`, `message` and other properties.

You can now reference properties other than `message` in a custom error page. Create `src/routes/+error.svelte`:

```svelte
/// file: src/routes/+error.svelte
<script>
	import { page } from '$app/state';
</script>

<h1>{page.status}</h1>
<p>{page.error.message}</p>
<p>error code: {page.error.code}</p>
```
