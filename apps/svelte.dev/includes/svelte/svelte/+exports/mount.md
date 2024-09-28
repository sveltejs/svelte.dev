<div class="ts-block">

```dts
function mount<
	Props extends Record<string, any>,
	Exports extends Record<string, any>
>(
	component:
		| ComponentType<SvelteComponent<Props>>
		| Component<Props, Exports, any>,
	options: {} extends Props
		? {
				target: Document | Element | ShadowRoot;
				anchor?: Node;
				props?: Props;
				events?: Record<string, (e: any) => any>;
				context?: Map<any, any>;
				intro?: boolean;
			}
		: {
				target: Document | Element | ShadowRoot;
				props: Props;
				anchor?: Node;
				events?: Record<string, (e: any) => any>;
				context?: Map<any, any>;
				intro?: boolean;
			}
): Exports;
```

</div>