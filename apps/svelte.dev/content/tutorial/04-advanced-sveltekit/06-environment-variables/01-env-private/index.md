---
title: $app/env/private
---

Environment variables — like API keys and database credentials — can be added to a `.env` file, and they will be made available to your application.

> [!NOTE] You can also use `.env.local` or `.env.[mode]` files — see the [Vite documentation](https://vitejs.dev/guide/env-and-mode.html#env-files) for more information. Make sure you add any files containing sensitive information to your `.gitignore` file!

In this exercise, we want to allow the user to enter the website if they know the correct passphrase, using an environment variable.

First, in `.env`, add a new environment variable:

```env
/// file: .env
PASSPHRASE=+++"open sesame"+++
```

Next, create `src/env.js`, import `defineEnvVars` from `@sveltejs/kit/env`, and declare `PASSPHRASE`:

```js
/// file: src/env.js
import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	PASSPHRASE: {}
});
```

Environment variables are private by default, so `PASSPHRASE` is now available from `$app/env/private`.

Open `src/routes/+page.server.js`. Import the named variable and use it inside the [form action](/tutorial/kit/the-form-element):

```js
/// file: src/routes/+page.server.js
import { redirect, fail } from '@sveltejs/kit';
+++import { PASSPHRASE } from '$app/env/private';+++

export function load({ cookies }) {
	if (cookies.get('allowed')) {
		redirect(307, '/welcome');
	}
}

export const actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();

		if (data.get('passphrase') === +++PASSPHRASE+++) {
			cookies.set('allowed', 'true');

			redirect(303, '/welcome');
		}

		return fail(403, {
			incorrect: true
		});
	}
};
```

The website is now accessible to anyone who knows the correct passphrase.

## Keeping secrets

It's important that sensitive data doesn't accidentally end up being sent to the browser, where it could easily be stolen by hackers and scoundrels.

SvelteKit makes it easy to prevent this from happening. Notice what happens if we try to import `PASSPHRASE` into `src/routes/+page.svelte`:

```svelte
/// file: src/routes/+page.svelte
<script>
	+++import { PASSPHRASE } from '$app/env/private';+++
	let { form } = $props();
</script>
```

An error overlay pops up, telling us that `$app/env/private` cannot be imported into client-side code. It can only be imported into server-only modules, including:

- SvelteKit server modules like `+page.server.js`, `+layout.server.js`, `+server.js` and `hooks.server.js`
- modules with a `server` filename segment, like `server.js`, `foo.server.js` or `foo.server.test.js`
- modules inside a `server` directory, except for `server` directories inside `src/routes` or `static`

In turn, these modules can only be imported by _other_ server modules.

## Dynamic vs static

Environment variables are dynamic by default — their values are read when the app runs, rather than being fixed when it is built. This means you can build the app once and deploy it to different environments with different values.

If a value is known at build time, you can add `static: true` to its definition. For example, add a feature flag to `.env`:

```env
/// file: .env
PASSPHRASE="open sesame"
FEATURE_FLAG_X=enabled
```

Then declare it as static:

```js
/// file: src/env.js
import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	PASSPHRASE: {},
	FEATURE_FLAG_X: {
		static: true
	}
});
```

Static values are inlined into your application code, enabling useful optimisations like dead-code elimination:

```js
import { FEATURE_FLAG_X } from '$app/env/private';

if (FEATURE_FLAG_X === 'enabled') {
	// code in here will be removed from the build output
	// if FEATURE_FLAG_X is not enabled
}
```

> [!NOTE] Prior to SvelteKit 3 you didn't have the option to declare an `env.js` file - instead, private environment variables were automatically available via `$env/dynamic/private` and `$env/static/private`.
