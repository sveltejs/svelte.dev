<div class="ts-block">

```dts
function crossfade({
	fallback,
	...defaults
}: CrossfadeParams & {
	fallback?: (
		node: Element,
		params: CrossfadeParams,
		intro: boolean
	) => TransitionConfig;
}): [
	(
		node: any,
		params: CrossfadeParams & {
			key: any;
		}
	) => () => TransitionConfig,
	(
		node: any,
		params: CrossfadeParams & {
			key: any;
		}
	) => () => TransitionConfig
];
```

</div>