<script lang="ts">
	import Section from '../components/Section.svelte';
	import type { Snippet } from 'svelte';

	let { one, two, three }: { one?: Snippet; two?: Snippet; three?: Snippet } = $props();
</script>

<Section>
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

	.grid {
		display: grid;
		gap: 1em;
		margin: 0 0 4rem 0;
	}

	.grid:last-child {
		margin-bottom: 0;
	}

	@media (min-width: 900px) {
		.grid {
			--columns: 3;

			gap: 7rem;
		}
	}
</style>
