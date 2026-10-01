---
title: Basics
---

There are two main types of errors in SvelteKit — _app_ errors and _unknown_ errors.

An app error is one that was thrown via the [`error`](/docs/kit/@sveltejs-kit#error) helper from `@sveltejs/kit`, as in `src/routes/app/+page.server.js`:

```js
/// file: src/routes/app/+page.server.js
import { error } from '@sveltejs/kit';

export function load() {
	error(420, 'Enhance your calm');
}
```

Any other error — such as the one in `src/routes/unknown/+page.server.js` — is treated as unknown:

```js
/// file: src/routes/unknown/+page.server.js
export function load() {
	throw new Error('Kaboom!');
}
```

When you throw an app error, you're telling SvelteKit 'don't worry, I know what I'm doing here'. An unknown error, by contrast, is assumed to be a bug in your app. When an unknown error is thrown, its message and stack trace will be logged to the console.

> [!NOTE] In a later chapter we'll learn about how to add custom error handling using the `handleError` hook.

If you click the links in this app, you'll notice an important difference: the app error message is shown to the user, whereas the unknown error message is redacted and replaced with a generic 'Internal Error' message and a 500 status code. That's because error messages can contain sensitive data.
