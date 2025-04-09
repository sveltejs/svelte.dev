---
title: $app/server
---



```js
// @noErrors
import { getRequestEvent, read } from '$app/server';
```

## getRequestEvent

Returns the current `RequestEvent`. Can be used inside server hooks, server `load` functions, actions, and endpoints (and functions called by them).

In environments without [`AsyncLocalStorage`](https://nodejs.org/api/async_context.html#class-asynclocalstorage), this must be called synchronously (i.e. not after an `await`).

<div class="ts-block">

```dts
function getRequestEvent(): RequestEvent<
	Partial<Record<string, string>>,
	string | null
>;
```

</div>



## read

Read the contents of an imported asset from the filesystem

```js
// @errors: 7031
import { read } from '$app/server';
import somefile from './somefile.txt';

const asset = read(somefile);
const text = await asset.text();
```

<div class="ts-block">

```dts
function read(asset: string): Response;
```

</div>




