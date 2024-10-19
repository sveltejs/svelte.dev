---
title: <svelte:element>
---

Sometimes you don't know in advance which element needs to be rendered. Rather than having a long list of `{#if ...}` blocks...

```svelte
/// file: App.svelte
{#if selected === 'h1'}
	<h1>I'm a <code>&lt;h1&gt;</code> element</h1>
{:else}
	<p>TODO others</p>
{/if}
```

...we can use `<svelte:element>`:

```svelte
/// file: App.svelte
+++<svelte:element this={selected}>
	I'm a <code>&lt;{selected}&gt;</code> element
</svelte:element>+++
```

The `this` value can be any string, or a falsy value — if it's falsy, no element is rendered.
