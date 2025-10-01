<script lang="ts">
	import type { Package } from '$lib/server/content';
	import PackageCard from './PackageCard.svelte';

	interface Props {
		title: string;
		packages: Package[];
		description?: string;
	}

	let { title, description, packages }: Props = $props();

	const INITIAL_ITEMS = 3;
	let showAll = $state(false);
	let visiblePackages = $derived(showAll ? packages : packages.slice(0, INITIAL_ITEMS));
</script>

<section class="category">
	<header>
		<h2>
			{title}
		</h2>
	</header>
	{#if description}
		<h3>{@html description}</h3>
	{/if}

	<div class="content">
		{#each visiblePackages as pkg}
			<div class="item">
				<PackageCard {pkg} />
			</div>
		{/each}
	</div>

	{#if packages.length > INITIAL_ITEMS}
		<div class="show-more-container">
			<button class="show-more-btn" onclick={() => (showAll = !showAll)}>
				{showAll ? 'Show Less' : `Show More (${packages.length - INITIAL_ITEMS})`}
			</button>
		</div>
	{/if}
</section>

<style>
	.category {
		margin-bottom: 3rem;
	}

	header {
		margin-bottom: 1rem;

		h2 {
			margin: 0;
		}
	}

	h3 {
		font: var(--sk-font-ui-medium);
		font-size: 1.5rem;
	}

	.content {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 2rem;
		margin-top: 1rem;
	}

	.item {
		height: 16rem;
		min-width: 0; /* Prevents grid items from overflowing */
	}

	.show-more-container {
		display: flex;
		justify-content: flex-end;
		margin-top: 1rem;
	}

	.show-more-btn {
		background: var(--sk-bg-3);
		border: 1px solid var(--sk-border);
		border-radius: var(--sk-border-radius);
		padding: 0.75rem 1.5rem;
		font: var(--sk-font-ui-medium);
		font-size: 1.2rem;
		color: var(--sk-text-1);
		cursor: pointer;
		transition: all 0.2s ease;

		&:hover {
			background: var(--sk-bg-4);
			border-color: var(--sk-text-3);
		}

		&:active {
			transform: translateY(1px);
		}
	}

	@media (max-width: 1024px) {
		.content {
			grid-template-columns: 1fr;
		}
	}
</style>
