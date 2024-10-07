---
title: Else blocks
---

Just like in JavaScript, an `if` block can have an `else` block:

```svelte
/// file: App.svelte
{#if count > 10}
	<p>{count} is greater than 10</p>
+++{:else}
	<p>{count} is between 0 and 10</p>+++
{/if}
```

`{#...}` opens a block. `{/...}` closes a block. `{:...}` _continues_ a block. Congratulations — you've already learned almost all the syntax Svelte adds to HTML.
