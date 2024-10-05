---
title: Component props
---

In Svelte 4, properties of a component were declared using `export let`. Each property was one declaration. In Svelte 5, all properties are declared through the `$props` rune, through destructuring:

```svelte
<script>
	---export let optional = 'unset';
	export let required;---
	+++let { optional = 'unset', required } = $props();+++
</script>
```

## Why we did this

`export let` was one of the more controversial API decisions, and there was a lot of debate about whether you should think about a property being `export`ed or `import`ed. `$props` doesn't have this trait. It's also in line with the other runes, and the general thinking reduces to "everything special to reactivity in Svelte is a rune".

There were also a lot of limitations around `export let`, which required additional API. These are discussed in the next section.
