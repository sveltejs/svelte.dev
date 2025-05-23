---
NOTE: do not edit this file, it is generated in apps/svelte.dev/scripts/sync-docs/index.ts
title: $app/environment
---



```js
// @noErrors
import { browser, building, dev, version } from '$app/environment';
```

## browser

`true` if the app is running in the browser.

<div class="ts-block">

```dts
const browser: boolean;
```

</div>



## building

SvelteKit analyses your app during the `build` step by running it. During this process, `building` is `true`. This also applies during prerendering.

<div class="ts-block">

```dts
const building: boolean;
```

</div>



## dev

Whether the dev server is running. This is not guaranteed to correspond to `NODE_ENV` or `MODE`.

<div class="ts-block">

```dts
const dev: boolean;
```

</div>



## version

The value of `config.kit.version.name`.

<div class="ts-block">

```dts
const version: string;
```

</div>




