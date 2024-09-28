<div class="ts-block">

```dts
function trusted(
	fn: (event: Event, ...args: Array<unknown>) => void
): (event: Event, ...args: unknown[]) => void;
```

</div>