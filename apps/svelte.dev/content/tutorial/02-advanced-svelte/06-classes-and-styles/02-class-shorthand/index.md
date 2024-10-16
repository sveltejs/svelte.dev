---
title: Shorthand class directive
---

Often, the name of the class will be the same as the name of the value it depends on:

```svelte
<button
	class="card"
	class:flipped={flipped}
	on:click={() => flipped = !flipped}
>
```

In those cases we can use a shorthand form:

```svelte
/// file: App.svelte
<button
	class="card"
	+++class:flipped+++
	on:click={() => flipped = !flipped}
>
```
