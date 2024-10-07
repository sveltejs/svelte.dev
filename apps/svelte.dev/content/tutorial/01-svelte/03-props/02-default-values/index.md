---
title: Default values
---

We can easily specify default values for props in `Nested.svelte`:

```svelte
/// file: Nested.svelte
<script>
	let { answer +++= 'a mystery'+++ } = $props();
</script>
```

If we now add a second component _without_ an `answer` prop, it will fall back to the default:

```svelte
/// file: App.svelte
<Nested answer={42}/>
+++<Nested />+++
```
