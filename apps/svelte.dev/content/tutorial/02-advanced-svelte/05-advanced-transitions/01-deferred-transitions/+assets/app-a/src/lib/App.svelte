<script>
	import TodoList from './TodoList.svelte';

	const todos = $state([
		{ done: false, description: 'write some docs' },
		{ done: false, description: 'start writing blog post' },
		{ done: true, description: 'buy some milk' },
		{ done: false, description: 'mow the lawn' },
		{ done: false, description: 'feed the turtle' },
		{ done: false, description: 'fix some bugs' }
	]);

	function remove(todo) {
		const index = todos.indexOf(todo);
		todos.splice(index, 1);
	}
</script>

<div class="board">
	<input
		placeholder="what needs to be done?"
		onkeydown={(e) => {
			if (e.key !== 'Enter') return;

			todos.push({
				done: false,
				description: e.currentTarget.value
			});

			e.currentTarget.value = '';
		}}
	/>

	<div class="todo">
		<h2>todo</h2>
		<TodoList todos={todos.filter((t) => !t.done)} {remove} />
	</div>

	<div class="done">
		<h2>done</h2>
		<TodoList todos={todos.filter((t) => t.done)} {remove} />
	</div>
</div>

<style>
	.board {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-column-gap: 1em;
		max-width: 36em;
		margin: 0 auto;
	}

	.board > input {
		font-size: 1.4em;
		grid-column: 1/3;
		padding: 0.5em;
		margin: 0 0 1rem 0;
	}

	h2 {
		font-size: 2em;
		font-weight: 200;
	}
</style>
