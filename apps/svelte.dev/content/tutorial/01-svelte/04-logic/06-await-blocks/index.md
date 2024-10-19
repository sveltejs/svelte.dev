---
title: Await blocks
---

Most web applications have to deal with asynchronous data at some point. Svelte makes it easy to _await_ the value of [promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises) directly in your markup:

```svelte
/// file: App.svelte
+++{#await promise}+++
	<p>...rolling</p>
+++{:then number}
	<p>you rolled a {number}!</p>
{:catch error}
	<p style="color: red">{error.message}</p>
{/await}+++
```

> [!NOTE] Only the most recent `promise` is considered, meaning you don't need to worry about race conditions.

If you know that your promise can't reject, you can omit the `catch` block. You can also omit the first block if you don't want to show anything until the promise resolves:

```svelte
{#await promise then number}
	<p>you rolled a {number}!</p>
{/await}
```
