<div class="ts-block">

```dts
function draw(
	node: SVGElement & {
		getTotalLength(): number;
	},
	{
		delay,
		speed,
		duration,
		easing
	}?: DrawParams | undefined
): TransitionConfig;
```

</div>