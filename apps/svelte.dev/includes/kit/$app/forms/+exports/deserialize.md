<div class="ts-block">

```dts
function deserialize<
	Success extends Record<string, unknown> | undefined,
	Failure extends Record<string, unknown> | undefined
>(
	result: string
): import('@sveltejs/kit').ActionResult<Success, Failure>;
```

</div>