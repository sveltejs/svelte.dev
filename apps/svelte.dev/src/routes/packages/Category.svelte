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
</script>

<section class="category">
	<header>
		<h2>{title}</h2>

		{#if description}
			<p>{@html description}</p>
		{/if}
	</header>

	<div class="grid">
		{#each packages.slice(0, INITIAL_ITEMS) as pkg}
			<div class="item">
				<PackageCard {pkg} />
			</div>
		{/each}
	</div>

	{#if packages.length > INITIAL_ITEMS}
		<details>
			<summary>
				<span class="raised button" aria-label="Toggle">
					<span class="icon"></span>
				</span>

				<span>
					{showAll ? 'show less' : `show all (${packages.length})`}
				</span>
			</summary>

			<div class="grid">
				{#each packages.slice(INITIAL_ITEMS) as pkg}
					<div class="item">
						<PackageCard {pkg} />
					</div>
				{/each}
			</div>
		</details>
	{/if}
</section>

<style>
	.category {
		margin-bottom: 12rem;
	}

	header {
		margin: 0 0 2rem 0;

		h2 {
			margin: 0 0 1rem 0;
		}

		p {
			margin: 0;
		}
	}

	.grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2rem;

		@media (min-width: 1024px) {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	details {
		position: relative;
		margin-bottom: 9rem;

		.grid {
			margin-top: 2rem;
		}
	}

	summary {
		position: absolute;
		bottom: -6rem;
		font: var(--sk-font-ui-small);
		display: flex;
		align-items: center;
		gap: 1rem;

		.icon {
			mask-size: 2rem;
			mask-image: url(icons/plus);

			[open] & {
				mask-image: url(icons/minus);
			}
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
