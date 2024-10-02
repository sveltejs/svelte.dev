---
title: svelte/server
---



```js
// @noErrors
import { render } from 'svelte/server';
```

## render

Only available on the server and when compiling with the `server` option.
Takes a component and returns an object with `body` and `head` properties on it, which you can use to populate the HTML when server-rendering your app.

<div class="ts-block">

```dts
function render<
	Comp extends SvelteComponent<any> | Component<any>,
	Props extends ComponentProps<Comp> = ComponentProps<Comp>
>(
	...args: {} extends Props
		? [
				component: Comp extends SvelteComponent<any>
					? ComponentType<Comp>
					: Comp,
				options?: {
					props?: Omit<Props, '$$slots' | '$$events'>;
					context?: Map<any, any>;
				}
			]
		: [
				component: Comp extends SvelteComponent<any>
					? ComponentType<Comp>
					: Comp,
				options: {
					props: Omit<Props, '$$slots' | '$$events'>;
					context?: Map<any, any>;
				}
			]
): RenderOutput;
```

</div>




