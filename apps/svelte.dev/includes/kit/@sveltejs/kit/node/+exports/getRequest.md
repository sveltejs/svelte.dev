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