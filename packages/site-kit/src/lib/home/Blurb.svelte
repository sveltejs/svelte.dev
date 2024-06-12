<script>
	import Section from '../components/Section.svelte';

	/** @type {{one?: import('svelte').Snippet, two?: import('svelte').Snippet, three?: import('svelte').Snippet}} */
	let { one, two, three } = $props();
</script>

<Section --background="var(--sk-back-1)">
	<div class="grid">
		{#if one}
			<div>
				{@render one()}
			</div>
		{/if}

		{#if two}
			<div>
				{@render two()}
			</div>
		{/if}

		{#if three}
			<div>
				{@render three()}
			</div>
		{/if}
	</div>
</Section>

<style>
	.grid {
		--columns: 1;

		display: grid;
		grid-template-columns: repeat(var(--columns), 1fr);
		grid-gap: 1rem;
	}

	.grid :global(h2) {
		font-size: var(--sk-text-xl);
		line-height: 1.2;
	}

	.grid {
		display: grid;
		gap: 1em;
		margin: 0 0 4rem 0;
	}

	.grid:last-child {
		margin-bottom: 0;
	}

	@media (min-width: 900px) {
		.grid :global(h2) {
			font-size: var(--sk-text-xl);
		}

		.grid {
			--columns: 3;

			gap: 7rem;
		}
	}
</style>
