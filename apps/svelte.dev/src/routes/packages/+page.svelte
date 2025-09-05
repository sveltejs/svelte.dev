<script lang="ts">
	import { forcefocus } from '@sveltejs/site-kit/actions';
	import { Icon } from '@sveltejs/site-kit/components';
	import PackageCard from './PackageCard.svelte';
	import Category from './Category.svelte';
	import { fly } from 'svelte/transition';

	const { data } = $props();

	const formatter = new Intl.NumberFormat();
</script>

<svelte:head>
	<title>Packages • Svelte</title>

	<meta name="twitter:title" content="Packages • Svelte" />
	<meta name="twitter:description" content="Packages for your Svelte and SvelteKit apps" />
	<meta name="Description" content="Packages for your Svelte and SvelteKit apps" />
</svelte:head>

<h1 class="visually-hidden">Packages</h1>

<div class="page content">
	<div in:fly={{ y: 20 }}>
		{#each data.homepage as { title, packages }}
			<Category {title} {packages} />
		{/each}
	</div>
</div>

<style>
	.page {
		padding: var(--sk-page-padding-top) var(--sk-page-padding-side) var(--sk-page-padding-bottom);

		min-width: 0 !important;
		max-width: 140rem;
		margin: 0 auto;
		text-wrap: balance;
	}

	.page :global(:where(h2, h3) code) {
		all: unset;
	}

	.controls {
		background: var(--background);
		display: flex;
		flex-direction: column;
		gap: 1rem;
		font: var(--sk-font-ui-medium);
		margin: 0 0 4rem 0;

		form {
			display: contents;
		}

		input {
			accent-color: var(--sk-fg-accent);
		}

		.sub {
			display: flex;
			gap: 2rem;
		}
	}

	.input-group {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex: 1;

		border-radius: 0.5rem;
		border: solid 1px var(--sk-border);
		padding: 1rem;
		margin-block-start: 1rem;

		position: relative;

		&:has(:focus-visible) {
			outline: 2px solid var(--sk-fg-accent);
			outline-offset: 4px;
		}

		input {
			font: var(--sk-font-ui-medium);
			width: 100%;
			color: var(--sk-fg-1);
			background: inherit;
			border: none;
			outline: none;

			&::placeholder {
				color: var(--sk-fg-4);
				opacity: 0.5;
			}
		}

		button {
			position: absolute;
			right: 4px;
			top: 50%;
			translate: 0 -50%;
			height: max-content;
			aspect-ratio: 1;
			color: var(--sk-fg-4);
			background: var(--sk-bg-3);

			&:hover,
			&:focus {
				color: var(--sk-fg-1);
			}

			&:focus-visible {
				outline-offset: -2px;
			}
		}
	}

	.posts {
		margin-block-start: 2rem;
		& > section {
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(37rem, 1fr));
			/* grid-auto-rows: 0.8fr; */
			gap: 2rem;
			flex-direction: column;
			margin-block-start: 2rem;
			margin-block-end: 4rem;
		}
	}
</style>
