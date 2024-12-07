---
title: Implicit snippet props
---

As an authoring convenience, snippets declared directly inside components become props _on_ those components. Take the `header` and `row` snippets and move them inside `<FilteredList>`:

```svelte
/// file: App.svelte
<FilteredList
	data={colors}
	field="name"
	{header}
	{row}
>
	+++{#snippet header()}...{/snippet}+++

	+++{#snippet row(d)}...{/snippet}+++
</FilteredList>

---{#snippet header()}...{/snippet}---

---{#snippet row(d)}...{/snippet}---
```

We can now remove them from the explicit props:

```svelte
/// file: App.svelte
<FilteredList data={colors} field="name" ---{header} {row}--->
	{#snippet header()}...{/snippet}

	{#snippet row(d)}...{/snippet}
</FilteredList>
```

Any content inside a component that is _not_ part of a declared snippet becomes a special `children` snippet. Since `header` has no parameters, we can turn it into `children` by removing the block tags...

```svelte
/// file: App.svelte
---{#snippet header()}---
<header>
	<span class="color"></span>
	<span class="name">name</span>
	<span class="hex">hex</span>
	<span class="rgb">rgb</span>
	<span class="hsl">hsl</span>
</header>
---{/snippet}---
```

...and renaming the `header` prop to `children` on the other side:

```svelte
/// file: FilteredList.svelte
<script>
	let { data, field, +++children+++, row } = $props();

	// ...
</script>
```

```svelte
/// file: FilteredList.svelte
<div class="header">
	+++{@render children()}+++
</div>
```
