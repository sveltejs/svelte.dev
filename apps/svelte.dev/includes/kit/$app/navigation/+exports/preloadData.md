<div class="ts-block">

```dts
function preloadData(href: string): Promise<
	| {
			type: 'loaded';
			status: number;
			data: Record<string, any>;
	  }
	| {
			type: 'redirect';
			location: string;
	  }
>;
```

</div>