<script lang="ts">
	import type { Package } from '$lib/server/content';
	import PackageCard from './PackageCard.svelte';

	interface Props {
		title: string;
		packages: Package[];
		description?: string;
	}

	let { title, description, packages }: Props = $props();
</script>

<section class="category">
	<header>
		<h2>{title}</h2>
	</header>
	{#if description}
		<h3>{@html description}</h3>
	{/if}

	<div class="content">
		{#each packages as pkg}
			<PackageCard {pkg} />
		{/each}
	</div>
</section>

<style>
	.category {
		--bleed: var(--sk-page-padding-side);
		margin-bottom: 4rem;
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
		margin-bottom: 0.5rem;
		color: var(--sk-fg-2);
	}

	.content {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(28rem, 1fr));
		gap: 1.5rem;
	}
</style>
