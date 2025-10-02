<script lang="ts">
	import type { Package } from '$lib/server/content';
	import PackageCard from './PackageCard.svelte';
	import type { Category } from '$lib/server/content';

	type Props = {
		open: boolean;
	} & Category;

	let { title, description, packages, hash, open }: Props = $props();

	const INITIAL_ITEMS = 3;
</script>

<section class="category">
	<header>
		<h2 id={hash}>
			<span>{title}</span>
			<a href="#{hash}" class="permalink" aria-label="permalink">aa</a>
		</h2>

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
		<details {open}>
			<summary>
				<span class="raised button" aria-label="Toggle">
					<span class="icon"></span>
				</span>

				<span class="show-more">show all ({packages.length})</span>
				<span class="show-less">show less</span>
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
		position: relative;

		h2 {
			margin: 0 0 1rem 0;
			position: relative;
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
		cursor: pointer;
		width: 100%;
		justify-content: flex-end;

		.show-more {
			display: block;

			[open] & {
				display: none;
			}
		}

		.show-less {
			display: none;

			[open] & {
				display: block;
			}
		}

		.icon {
			mask-size: 2rem;
			mask-image: url(icons/plus);

			[open] & {
				mask-image: url(icons/minus);
			}
		}

		.button {
			order: 1;

			summary:hover & {
				border-color: var(--sk-raised-hover-color);
			}
		}

		@media (min-width: 1024px) {
			justify-content: flex-start;

			.button {
				order: 0;
			}
		}
	}

	.item {
		height: 16rem;
		min-width: 0; /* Prevents grid items from overflowing */
	}

	/* permalink */
	[id] {
		scroll-margin-top: calc(var(--sk-nav-height) + 2rem) !important;
	}

	a.permalink {
		position: absolute !important;
		display: block;
		background: var(--sk-fg-1);
		color: var(--sk-fg-1) !important;
		mask: url(icons/hash) 50% 50% no-repeat;
		mask-size: 2.4rem 2.4rem;
		width: 2.6rem;
		height: 2.2rem;
		top: calc(50% - 1rem);

		@media (max-width: 767px) {
			right: 0;
			scale: 0.8;
		}

		@media (min-width: 768px) {
			left: -3rem;
			opacity: 0;
			transition: opacity 0.2s;

			h2:hover &,
			&:focus {
				opacity: 1;
			}
		}
	}
</style>
