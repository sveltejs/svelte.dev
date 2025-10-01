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
			<label>
				<button
					class="raised"
					aria-label="Show more"
					aria-pressed={showAll}
					onclick={() => (showAll = !showAll)}><span class="icon"></span></button
				>

				{showAll ? 'show less' : `show all (${packages.length})`}
			</label>
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
		grid-template-columns: 1fr;
		gap: 2rem;
		margin-top: 1rem;

		@media (min-width: 1024px) {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.item {
		height: 16rem;
		min-width: 0; /* Prevents grid items from overflowing */
	}

	.show-more-container {
		display: flex;
		justify-content: flex-end;
		margin-top: 2rem;

		label {
			font: var(--sk-font-ui-small);
			display: flex;
			align-items: center;
			gap: 1rem;

			.icon {
				mask-size: 2rem;
				mask-image: url(icons/minus);
			}

			button[aria-pressed='false'] .icon {
				mask-image: url(icons/plus);
			}
		}

		button {
			order: 1;
		}

		@media (min-width: 1024px) {
			justify-content: flex-start;

			button {
				order: 0;
			}
		}
	}
</style>
