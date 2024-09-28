<div class="ts-block">

```dts
function isHttpError<T extends number>(
	e: unknown,
	status?: T | undefined
): e is HttpError_1 & {
	status: T extends undefined ? never : T;
};
```

</div>