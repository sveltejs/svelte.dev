<script>
	import { page } from '$app/stores';
	import { DocsContents } from '@sveltejs/site-kit/docs';

	let { data, children } = $props();

	const pageData = $derived($page.data.document);
	const title = $derived(pageData?.metadata.title);
	const category = $derived(pageData?.category);
</script>

<div class="container">
	<div class="toc-container" style="order: 1">
		<DocsContents contents={data.sections} />
	</div>

	<div class="page content">
		{#if category}
			<p class="category">{category}</p>
		{/if}
		{#if title}
			<h1>{title}</h1>
		{/if}

		{@render children()}
	</div>
</div>

<style>
	.container {
		--sidebar-menu-width: 28rem;
		--sidebar-width: var(--sidebar-menu-width);

		display: flex;
		flex-direction: column;
	}

	.page {
		padding: var(--sk-page-padding-top) var(--sk-page-padding-side);

		min-width: 0 !important;
	}

	.page :global(:where(h2, h3) code) {
		all: unset;
	}

	.category {
		font: 700 var(--sk-text-s) var(--sk-font);
		text-transform: uppercase;
		letter-spacing: 0.12em;
		margin: 0 0 0.5em;
		color: var(--sk-text-3);
	}

	@media (min-width: 832px) {
		.content {
			padding-left: calc(var(--sidebar-width) + var(--sk-page-padding-side));
		}
	}

	.toc-container {
		background: var(--sk-back-3);
		display: none;
	}

	@media (min-width: 832px) {
		.toc-container {
			display: block;
			width: var(--sidebar-width);
			height: calc(100vh - var(--sk-nav-height) - var(--sk-banner-bottom-height));
			position: fixed;
			left: 0;
			top: var(--sk-nav-height);
			overflow: hidden;
		}

		.page {
			padding-left: calc(var(--sidebar-width) + var(--sk-page-padding-side));
		}
	}

	@media (min-width: 1200px) {
		.container {
			--sidebar-width: max(28rem, 23vw);
			flex-direction: row;
		}

		.page {
			--on-this-page-display: block;
			padding: var(--sk-page-padding-top) calc(var(--sidebar-width) + var(--sk-page-padding-side));
			margin: 0 auto;
			width: var(--sk-line-max-width);
			box-sizing: content-box;
		}
	}
</style>
