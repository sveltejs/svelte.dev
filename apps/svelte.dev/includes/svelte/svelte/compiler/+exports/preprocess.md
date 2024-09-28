<div class="ts-block">

```dts
function preprocess(
	source: string,
	preprocessor: PreprocessorGroup | PreprocessorGroup[],
	options?:
		| {
				filename?: string;
		  }
		| undefined
): Promise<Processed>;
```

</div>