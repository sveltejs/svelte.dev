<div class="ts-block">

```dts
function enhance<
	Success extends Record<string, unknown> | undefined,
	Failure extends Record<string, unknown> | undefined
>(
	form_element: HTMLFormElement,
	submit?: import('@sveltejs/kit').SubmitFunction<
		Success,
		Failure
	>
): {
	destroy(): void;
};
```

</div>