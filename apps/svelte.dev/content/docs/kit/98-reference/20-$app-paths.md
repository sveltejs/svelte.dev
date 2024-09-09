---
title: $app/paths
---



```js
// @noErrors
import { assets, base, resolveRoute } from '$app/paths';
```

## assets

An absolute path that matches [`config.kit.paths.assets`](/docs/kit/reference/configuration#paths).

> If a value for `config.kit.paths.assets` is specified, it will be replaced with `'/_svelte_kit_assets'` during `vite dev` or `vite preview`, since the assets don't yet live at their eventual URL.

<div class="ts-block">

```ts
// @noErrors
let assets:
	| ''
	| `https://${string}`
	| `http://${string}`
	| '/_svelte_kit_assets';
```

</div>

## base

A string that matches [`config.kit.paths.base`](/docs/kit/reference/configuration#paths).

Example usage: `<a href="{base}/your-page">Link</a>`

<div class="ts-block">

```ts
// @noErrors
let base: '' | `/${string}`;
```

</div>

## resolveRoute

Populate a route ID with params to resolve a pathname.

<div class="ts-block">

```ts
// @noErrors
function resolveRoute(
	id: string,
	params: Record<string, string | undefined>
): string;
```

</div>


