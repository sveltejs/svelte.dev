---
title: Each block bindings
---

You can bind to properties inside an `each` block.

```svelte
/// file: App.svelte
{#each todos as todo}
	<li class={{ done: todo.done }}>
		<input
			type="checkbox"
			+++bind:+++checked={todo.done}
		/>

		<input
			type="text"
			placeholder="What needs to be done?"
			+++bind:+++value={todo.text}
		/>
	</li>
{/each}
```
