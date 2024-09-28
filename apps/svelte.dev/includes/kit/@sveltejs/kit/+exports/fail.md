<div class="ts-block">

```dts
function fail<
	T extends Record<string, unknown> | undefined = undefined
>(status: number, data: T): ActionFailure<T>;
```

</div>