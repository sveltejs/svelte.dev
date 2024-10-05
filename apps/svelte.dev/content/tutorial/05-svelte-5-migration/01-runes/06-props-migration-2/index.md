---
title: Component props (advanced)
---

There are multiple cases where declaring properties becomes less straightforward than having a few `export let` declarations:

- you want to rename the property, for example because the name is a reserved identifier (e.g. `class`)
- you don't know which other properties to expect in advance
- you want to forward every property to another component

All these cases need special syntax in Svelte 4:

- renaming: `export { klass as class}`
- other properties: `$$restProps`
- all properties `$$props`

In Svelte 5, the `$props` rune makes this straightforward without any additional Svelte-specific syntax:

- renaming: use property renaming `let { class: klass } = $props();`
- other properties: use spreading `let { foo, bar, ...rest } = $props();`
- all properties: don't destructure `let props = $props();`

Let's transform our component to using the new syntax.

```svelte
<script>
	---let klass = '';
	export { klass as class};---
	+++let { class: klass, ...rest } = $props();+++
</script>

<button {class} {...rest}>click me</button>
```

## Why we did this

It should become clear by now that `export let` had a lot of limitations beyond simple cases, which meant we had to add more APIs. With `$props` we can remove a lot of that stuff in favor of a simpler, more robust model.
