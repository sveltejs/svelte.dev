<script lang="ts">
	import { Text } from '@sveltejs/site-kit/components';
	import { legacy_details } from '@sveltejs/site-kit/actions';
	import { setupDocsHovers } from '@sveltejs/site-kit/docs';
	import { onMount } from 'svelte';
	import OnThisPage from './OnThisPage.svelte';
	import Breadcrumbs from './Breadcrumbs.svelte';
	import PageControls from '$lib/components/PageControls.svelte';
	import { goto } from '$app/navigation';
	import { escape_html } from '$lib/utils/escape';
	import { page } from '$app/state';
	import { get_topic_title } from '$lib/topics';

	let { data } = $props();

	setupDocsHovers();

	let content = $state() as HTMLElement;

	const repo = $derived.by(() => {
		const name = data.document.slug.split('/')[1];
		const link = 'docs/' + data.document.file.split('/').slice(2).join('/');
		return `https://github.com/sveltejs/${name}/edit/main/documentation/${link}`;
	});

	const topic_title = $derived(get_topic_title(page.params.topic));

	onMount(() => {
		// hash was lowercase in v4 docs and varying case in v5 docs
		const hash = location.hash.slice(1);

		// if there's no hash, or an exact match, no need to redirect
		// also semi-handles the case where one appears twice with difference casing
		// e.g. https://svelte.dev/docs/kit/@sveltejs-kit#redirect vs https://svelte.dev/docs/kit/@sveltejs-kit#Redirect
		// but browsers make it impossible to really do: https://github.com/sveltejs/svelte.dev/issues/590
		if (hash === '' || content.querySelector(`[id="${hash}"]`)) {
			return;
		}

		// kit/svelte4 replaced `:` character
		// e.g. we want to redirect progressive-enhancement-use-enhance to Progressive-enhancement-use:enhance
		// kit docs also had types in URL that we want to replace. e.g.
		// https://kit.svelte.dev/docs/types#public-types-loadevent
		// https://kit.svelte.dev/docs/types#private-types-cspdirectives
		const id = hash
			.toLowerCase()
			.replaceAll(':', '-')
			.replaceAll('public-types-', '')
			.replaceAll('private-types-', '');

		for (const heading of content.querySelectorAll('[id]')) {
			if (heading.id.toLowerCase().replaceAll(':', '-') === id) {
				goto(`#${heading.id}`, {
					replaceState: true
				});

				break;
			}
		}
	});
</script>

<svelte:head>
	<title>{data.document.metadata.title} • {topic_title} Docs</title>

	<meta name="twitter:title" content="{data.document.metadata.title} • {topic_title} Docs" />
	<meta
		name="twitter:description"
		content="{data.document.metadata.title} • {topic_title} documentation"
	/>
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="description" content="{data.document.metadata.title} • {topic_title} documentation" />
	<meta
		name="twitter:image"
		content="https://svelte.dev/docs/{page.params.topic}/{page.params.path}/card.png"
	/>
	<meta
		name="og:image"
		content="https://svelte.dev/docs/{page.params.topic}/{page.params.path}/card.png"
	/>
</svelte:head>

<div id="docs-content" use:legacy_details>
	<header>
		<Breadcrumbs breadcrumbs={data.document.breadcrumbs.slice(1)} />
		<h1>{@html escape_html(data.document.metadata.title).replaceAll('/', '/<wbr>')}</h1>
	</header>

	<OnThisPage {content} document={data.document} />

	<!-- TODO emit scroll events from <Text> so we don't need the `bind:this` and can ditch the wrapper element -->
	<div class="text content" bind:this={content}>
		<Text>
			{@html data.document.body}
		</Text>
	</div>

	<PageControls
		llms
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
