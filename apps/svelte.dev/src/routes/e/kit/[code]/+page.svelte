<script lang="ts">
	let { params, data } = $props();
</script>

<main>
	<h2>{params.code}</h2>

	{#each data.variants as variant}
		<blockquote>
			{@html variant}
		</blockquote>
	{/each}

	{@html data.details}
</main>

<style>
	main {
		padding: var(--sk-page-padding-top) var(--sk-page-padding-side) 6rem var(--sk-page-padding-side);
		max-width: var(--sk-page-content-width);
		margin: 0 auto;
	}

	blockquote {
		padding: 2rem;
		background: var(--sk-bg-2);
		border: 1px solid var(--sk-border);
		border-radius: var(--sk-border-radius);
	}
</style>
