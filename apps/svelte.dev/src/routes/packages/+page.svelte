<script lang="ts">
	import Category from './Category.svelte';
	import { page } from '$app/state';

	const { data } = $props();
</script>

<svelte:head>
	<title>Packages • Svelte</title>

	<meta name="twitter:title" content="Packages • Svelte" />
	<meta name="twitter:description" content="Packages for your Svelte and SvelteKit apps" />
	<meta name="Description" content="Packages for your Svelte and SvelteKit apps" />
</svelte:head>

<div class="page content">
	<header>
		<h1>Packages</h1>
		<p>
			We’ve collected a few of our favourite packages that work well with Svelte and SvelteKit apps.
			Official packages are marked with the <span class="svelte-logo" aria-label="Svelte"></span> logo.
		</p>
	</header>

	<div>
		{#each data.homepage as category}
			<Category {...category} open={page.url.hash === `#${category.hash}`} />
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

	header {
		margin: 0 0 4rem 0;
	}

	h1 {
		margin: 0 0 2rem 0;
	}

	.svelte-logo {
		position: relative;
		top: 0.15em;
		display: inline-block;
		width: 1em;
		aspect-ratio: 1;
		background: #ff3e00;
		mask-size: contain;
		mask-image: url(icons/svelte-cutout);
		mask-repeat: no-repeat;
		mask-position: 50% 50%;
	}
</style>
