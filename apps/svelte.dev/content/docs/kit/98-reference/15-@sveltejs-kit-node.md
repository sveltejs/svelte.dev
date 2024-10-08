---
title:  @sveltejs/kit/node
---



```js
// @noErrors
import {
	createReadableStream,
	getRequest,
	setResponse
} from '@sveltejs/kit/node';
```

## createReadableStream

Converts a file on disk to a readable stream

<div class="ts-block">

```dts
function createReadableStream(file: string): ReadableStream;
```

</div>



## getRequest

<div class="ts-block">

```dts
function getRequest({
	request,
	base,
	bodySizeLimit
}: {
	request: import('http').IncomingMessage;
	base: string;
	bodySizeLimit?: number;
}): Promise<Request>;
```

</div>



## setResponse

<div class="ts-block">

```dts
function setResponse(
	res: import('http').ServerResponse,
	response: Response
): Promise<void>;
```

</div>




