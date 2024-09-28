<div class="ts-block">

```dts
function goto(
	url: string | URL,
	opts?:
		| {
				replaceState?: boolean | undefined;
				noScroll?: boolean | undefined;
				keepFocus?: boolean | undefined;
				invalidateAll?: boolean | undefined;
				state?: App.PageState | undefined;
		  }
		| undefined
): Promise<void>;
```

</div>