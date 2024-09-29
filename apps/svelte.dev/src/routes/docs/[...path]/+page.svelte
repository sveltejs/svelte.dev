<script lang="ts">
	import { Icon, Text } from '@sveltejs/site-kit/components';
	import { copy_code_descendants, legacy_details, ts_js_select } from '@sveltejs/site-kit/actions';
	import { setupDocsHovers } from '@sveltejs/site-kit/docs';
	import OnThisPage from './OnThisPage.svelte';
	import Breadcrumbs from './Breadcrumbs.svelte';

	let { data } = $props();

	setupDocsHovers();

	let content = $state() as HTMLElement;
</script>

<svelte:head>
	<title>{data.document.metadata.title} • Docs • Svelte</title>

	<meta name="twitter:title" content="{data.document.metadata.title} • Docs • Svelte" />
	<meta
		name="twitter:description"
		content="{data.document.metadata.title} • Svelte documentation"
	/>
	<meta name="Description" content="{data.document.metadata.title} • Svelte documentation" />
</svelte:head>

<div id="docs-content" use:ts_js_select use:copy_code_descendants use:legacy_details>
	<header>
		<Breadcrumbs breadcrumbs={data.document.breadcrumbs.slice(1)} />
		<h1>{data.document.metadata.title}</h1>
	</header>

	<OnThisPage {content} document={data.document} />

	<!-- TODO emit scroll events from <Text> so we don't need the `bind:this` and can ditch the wrapper element -->
	<div class="text content" bind:this={content}>
		<Text>
			{@html data.document.body}
		</Text>
	</div>

	<p class="edit">
		<a
			class="edit"
			href="https://github.com/sveltejs/svelte.dev/edit/main/apps/svelte.dev/content/{data.document
				.file}"
		>
			<Icon size={50} name="edit" /> Edit this page on GitHub
		</a>
	</p>
</div>

<div class="controls">
	<div>
		<span class:faded={!data.document.prev}>previous</span>

		{#if data.document.prev}
			<a href="/{data.document.prev.slug}">{data.document.prev.title}</a>
		{/if}
	</div>

	<div>
		<span class:faded={!data.document.next}>next</span>
		{#if data.document.next}
			<a href="/{data.document.next.slug}">{data.document.next.title}</a>
		{/if}
	</div>
</div>

<style>
	.edit {
		position: relative;
		font-size: 1.4rem;
		line-height: 1;
		z-index: 2;
		margin: 6rem 0 2rem 0;
		font-family: var(--sk-font-ui);

		a {
			text-decoration: none;
		}

		:global(.icon) {
			position: relative;
			top: -0.1rem;
			left: 0.3rem;
			width: 1.4rem;
			height: 1.4rem;
			margin-right: 0.5rem;
		}
	}

	.controls {
		max-width: calc(var(--sk-line-max-width) + 1rem);
		border-top: 1px solid var(--sk-back-4);
		padding: 1rem 0 0 0;
		display: grid;
		grid-template-columns: 1fr 1fr;
		margin: 1rem 0 0 0;
	}

	.controls > :first-child {
		text-align: left;
	}

	.controls > :last-child {
		text-align: right;
	}

	.controls span {
		display: block;
		font-size: var(--sk-text-s);
		text-transform: uppercase;
		font-weight: 400;
		font-family: var(--sk-font-ui);
		color: var(--sk-text-3);
	}

	.controls span.faded {
		opacity: 0.4;
	}
</style>
