---
title: $app/paths
---



```js
// @noErrors
import { assets, base, resolveRoute } from '$app/paths';
```

## assets

An absolute path that matches [`config.kit.paths.assets`](/docs/kit/configuration#paths).

> [!NOTE] If a value for `config.kit.paths.assets` is specified, it will be replaced with `'/_svelte_kit_assets'` during `vite dev` or `vite preview`, since the assets don't yet live at their eventual URL.

<div class="ts-block">

```dts
let assets:
	| ''
	| `https://${string}`
	| `http://${string}`
	| '/_svelte_kit_assets';
```

</div>



## base

A string that matches [`config.kit.paths.base`](/docs/kit/configuration#paths).

Example usage: `<a href="{base}/your-page">Link</a>`

<div class="ts-block">

```dts
let base: '' | `/${string}`;
```

</div>



## resolveRoute

Populate a route ID with params to resolve a pathname.

```js
// @errors: 7031
import { resolveRoute } from '$app/paths';

resolveRoute(
	`/blog/[slug]/[...somethingElse]`,
	{
		slug: 'hello-world',
		somethingElse: 'something/else'
	}
); // `/blog/hello-world/something/else`
```

<div class="ts-block">

```dts
function resolveRoute(
	id: string,
	params: Record<string, string | undefined>
): string;
```

</div>




