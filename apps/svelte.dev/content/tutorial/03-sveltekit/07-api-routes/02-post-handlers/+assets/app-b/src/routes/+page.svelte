<script>
	let { data } = $props();
</script>

<div class="centered">
	<h1>todos</h1>

	<label>
		add a todo:
		<input
			type="text"
			autocomplete="off"
			onkeydown={async (e) => {
				if (e.key !== 'Enter') return;

				const input = e.currentTarget;
				const description = input.value;
				
				const response = await fetch('/todo', {
					method: 'POST',
					body: JSON.stringify({ description }),
					headers: {
						'Content-Type': 'application/json'
					}
				});

				const { id } = await response.json();

				const todos = [...data.todos, {
					id,
					description
				}];

				data = { ...data, todos };

				input.value = '';
			}}
		/>
	</label>

	<ul class="todos">
		{#each data.todos as todo (todo.id)}
			<li>
				<label>
					<input
						type="checkbox"
						checked={todo.done}
						onchange={async (e) => {
							const done = e.currentTarget.checked;

							// TODO handle change
						}}
					/>
					<span>{todo.description}</span>
					<button
						aria-label="Mark as complete"
						onclick={async (e) => {
							// TODO handle delete
						}}
					></button>
				</label>
			</li>
		{/each}
	</ul>
</div>

<style>
	.centered {
		max-width: 20em;
		margin: 0 auto;
	}

	label {
		display: flex;
		width: 100%;
	}

	input[type="text"] {
		flex: 1;
	}

	span {
		flex: 1;
	}

	button {
		border: none;
		background: url(./remove.svg) no-repeat 50% 50%;
		background-size: 1rem 1rem;
		cursor: pointer;
		height: 100%;
		aspect-ratio: 1;
		opacity: 0.5;
		transition: opacity 0.2s;
	}

	button:hover {
		opacity: 1;
	}
</style>
	