---
title: Redirects
---

We can use the `redirect` mechanism to redirect from one page to another.

Create a new `load` function in `src/routes/a/+page.server.js`:

```js
/// file: src/routes/a/+page.server.js
import { redirect } from '@sveltejs/kit';

export function load() {
	redirect(307, '/b');
}
```

Navigating to `/a` will now take us straight to `/b`.

You can `redirect(...)` inside `load` functions, form actions, API routes and the `handle` hook, which we'll discuss in a later chapter.

The most common status codes you'll use:

- `303` — for form actions, following a successful submission
- `307` — for temporary redirects
- `308` — for permanent redirects

> [!NOTE] `redirect(...)` throws, like `error(...)`, meaning no code _after_ the redirect will run.
