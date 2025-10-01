<script lang="ts">
	import Category from './Category.svelte';

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
			We've collected a few of our favourite packages that work well with Svelte and SvelteKit apps.
		</p>
	</header>

	<div>
		{#each data.homepage as { title, description, packages }}
			<Category {title} {description} {packages} />
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
</style>
