---
title: $app/environment
---



```js
// @noErrors
import { browser, building, dev, version } from '$app/environment';
```

## browser

`true` if the app is running in the browser.

<div class="ts-block">

```ts
// @noErrors
const browser: boolean;
```

</div>

## building

SvelteKit analyses your app during the `build` step by running it. During this process, `building` is `true`. This also applies during prerendering.

<div class="ts-block">

```ts
// @noErrors
const building: boolean;
```

</div>

## dev

Whether the dev server is running. This is not guaranteed to correspond to `NODE_ENV` or `MODE`.

<div class="ts-block">

```ts
// @noErrors
const dev: boolean;
```

</div>

## version

The value of `config.kit.version.name`.

<div class="ts-block">

```ts
// @noErrors
const version: string;
```

</div>


