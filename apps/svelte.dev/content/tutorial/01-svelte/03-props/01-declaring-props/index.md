---
title: Declaring props
---

So far, we've dealt exclusively with internal state — that is to say, the values are only accessible within a given component.

In any real application, you'll need to pass data from one component down to its children. To do that, we need to declare _properties_, generally shortened to 'props'. In Svelte, we do that with the `$props` rune. Edit the `Nested.svelte` component:

```svelte
/// file: Nested.svelte
<script>
	let { answer } = +++$props()+++;
</script>
```
