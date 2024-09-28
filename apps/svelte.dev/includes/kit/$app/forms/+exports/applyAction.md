<div class="ts-block">

```dts
function applyAction<
	Success extends Record<string, unknown> | undefined,
	Failure extends Record<string, unknown> | undefined
>(
	result: import('@sveltejs/kit').ActionResult<
		Success,
		Failure
	>
): Promise<void>;
```

</div>