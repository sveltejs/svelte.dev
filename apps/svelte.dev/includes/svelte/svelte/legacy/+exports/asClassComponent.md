<div class="ts-block">

```dts
function asClassComponent<
	Props extends Record<string, any>,
	Exports extends Record<string, any>,
	Events extends Record<string, any>,
	Slots extends Record<string, any>
>(
	component:
		| SvelteComponent<Props, Events, Slots>
		| Component<Props>
): ComponentType<
	SvelteComponent<Props, Events, Slots> & Exports
>;
```

</div>