---
title: $app/env/public
---

Some environment variables can safely be exposed to the browser. In this exercise, we'll use two of them to control the page's colour scheme.

Add values to the two environment variables in `.env`:

```env
/// file: .env
THEME_BACKGROUND=+++"steelblue"+++
THEME_FOREGROUND=+++"bisque"+++
```

Next, create `src/env.js`. Import `defineEnvVars` from `@sveltejs/kit/env`, and configure both variables with `public: true`:

```js
/// file: src/env.js
import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	THEME_BACKGROUND: {
		public: true
	},
	THEME_FOREGROUND: {
		public: true
	}
});
```

You can now import the variables into `src/routes/+page.svelte` from `$app/env/public`:

```svelte
/// file: src/routes/+page.svelte
<script>
---	const THEME_BACKGROUND = 'white';
	const THEME_FOREGROUND = 'black';---
+++	import {
		THEME_BACKGROUND,
		THEME_FOREGROUND
	} from '$app/env/public';+++
</script>
```

Environment variables are dynamic by default, meaning their values are read when the app starts. If a variable is known when the app is built, you can add `static: true` to its configuration to inline its value into the bundle, enabling optimisations like dead-code elimination.

> [!NOTE] Prior to SvelteKit 3 you didn't have the option to declare an `env.js` file - instead, you had to prefix your environment variables with `PUBLIC_` to make them available via `$env/dynamic/public` and `$env/static/public`
