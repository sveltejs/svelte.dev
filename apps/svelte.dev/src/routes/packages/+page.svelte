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
		{#each data.homepage as { title, href, packages }}
			<Category {title} {href} {packages} />
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
</style>
