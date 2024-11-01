---
title: Passing snippets to components
---

Since snippets — like functions — are just values, they can be passed to components as props.

Take this `<FilteredList>` component. Its job is to filter the `data` that gets passed into it, but it has no opinions about how that data should be rendered — that's the responsibility of the parent component.

We've already got some snippets defined. Begin by passing them into the `<FilteredList>`:

```svelte
/// file: App.svelte
<FilteredList
	data={colors}
	field="name"
	+++{header}+++
	+++{row}+++
></FilteredList>
```

Then, on the other side, declare `header` and `row` as props:

```svelte
/// file: FilteredList.svelte
<script>
	let { data, field, +++header, row+++ } = $props();

	// ...
</script>
```

Finally, replace the placeholder content with render tags:

```svelte
/// file: FilteredList.svelte
<div class="header">
	+++{@render header()}+++
</div>

<div class="content">
	{#each filtered as d}
		+++{@render row(d)}+++
	{/each}
</div>
```

Never again will you have to memorize the hex code for `MistyRose` or `PeachPuff`.
