<script lang="ts">
	import { Text } from '@sveltejs/site-kit/components';
	import { legacy_details } from '@sveltejs/site-kit/actions';
	import { setupDocsHovers } from '@sveltejs/site-kit/docs';
	import OnThisPage from './OnThisPage.svelte';
	import Breadcrumbs from './Breadcrumbs.svelte';
	import PageControls from '$lib/components/PageControls.svelte';

	let { data } = $props();

	setupDocsHovers();

	let content = $state() as HTMLElement;

	const repo = $derived.by(() => {
		const name = data.document.slug.split('/')[1];
		const link = 'docs/' + data.document.file.split('/').slice(2).join('/');
		return `https://github.com/sveltejs/${name}/edit/main/documentation/${link}`;
	});
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

<div id="docs-content" use:legacy_details>
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

	<PageControls
		{repo}
		prev={data.document.prev && {
			title: data.document.prev.title,
			path: `/${data.document.prev.slug}`
		}}
		next={data.document.next && {
			title: data.document.next.title,
			path: `/${data.document.next.slug}`
		}}
	/>
</div>
