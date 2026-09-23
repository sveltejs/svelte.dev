---
title: Param matchers
path: /colors/ff3e00
---

To prevent the router from matching on invalid input, you can specify a _matcher_. For example, you might want a route like `/colors/[value]` to match hex values like `/colors/ff3e00` but not named colors like `/colors/octarine` or any other arbitrary input.

Matchers are defined in a single `src/params.js` file. Create it and use `defineParams` to add a `hex` matcher:

```js
/// file: src/params.js
import { defineParams } from '@sveltejs/kit/params';

export const params = defineParams({
	hex(value) {
		return /^[0-9a-f]{6}$/.test(value) ? value : undefined;
	}
});
```

Matchers return the parsed value that will be added to `page.params`, or `undefined` if the value does not match. Here, a valid hex value is returned unchanged, so `page.params.color` remains a string.

Then, to use the new matcher, rename `src/routes/colors/[color]` to `src/routes/colors/[color=hex]`.

Now, whenever someone navigates to that route, SvelteKit will verify that `color` is a valid `hex` value and use the value returned by the matcher. If it returns `undefined`, SvelteKit will try to match other routes, before eventually returning a 404.

> [!NOTE] Matchers run both on the server and in the browser.
