<script>
	let { todos, remove } = $props();
</script>

<ul class="todos">
	{#each todos as todo (todo.id)}
		<li
			class={{ done: todo.done }}
		>
			<label>
				<input type="checkbox" bind:checked={todo.done}/>
				<span>{todo.description}</span>
				<button onclick={() => remove(todo)} aria-label="Remove"></button>
			</label>
		</li>
	{/each}
</ul>

<style>
	label {
		width: 100%;
		height: 100%;
		display: flex;
	}

	span {
		flex: 1;
	}

	button {
		background-image: url(./remove.svg);
	}
</style>
