<script>
	let { data, field } = $props();

	let search = $state('');

	let filtered = $derived.by(() => {
		if (search === '') return data;

		const regex = new RegExp(search, 'i');
		return data.filter((d) => regex.test(d[field]));
	});
</script>

<div class="list">
	<label>
		Filter: <input bind:value={search} />
	</label>

	<div class="header">
		<p>TODO add header</p>
	</div>

	<div class="content">
		{#each filtered as d}
			<p>TODO add row</p>
		{/each}
	</div>
</div>

<style>
	.list {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.header {
		border-top: 1px solid var(--bg-2);
		padding: 0.2em 0;
	}

	.content {
		flex: 1;
		overflow: auto;
		padding-top: 0.5em;
		border-top: 1px solid var(--bg-2);
	}
</style>
