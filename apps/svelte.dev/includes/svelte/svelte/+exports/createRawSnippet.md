<div class="ts-block">

```dts
function createRawSnippet<Params extends unknown[]>(
	fn: (...params: Getters<Params>) => {
		render: () => string;
		setup?: (element: Element) => void | (() => void);
	}
): Snippet<Params>;
```

</div>