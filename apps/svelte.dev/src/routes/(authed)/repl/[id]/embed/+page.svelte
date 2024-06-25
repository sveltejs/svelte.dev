<script lang="ts">
	import { browser } from '$app/environment';
	import { afterNavigate } from '$app/navigation';
	import { theme } from '@sveltejs/site-kit/stores';
	import { Repl } from '@sveltejs/repl';
	import { mapbox_setup } from '../../../../../config.js';
	import { onMount } from 'svelte';

	let { data } = $props();

	let version = $state(data.version);
	let repl = $state() as Repl;

	function update_query_string(version: string) {
		const params = [];

		if (version !== 'latest') params.push(`version=${version}`);

		const url =
			params.length > 0
				? `/repl/${data.gist.id}/embed?${params.join('&')}`
				: `/repl/${data.gist.id}/embed`;

		history.replaceState({}, 'x', url);
	}

	$effect(() => {
		update_query_string(version);
	});

	onMount(() => {
		if (data.version !== 'local') {
			fetch(`https://unpkg.com/svelte@${data.version || 'next'}/package.json`)
				.then((r) => r.json())
				.then((pkg) => {
					version = pkg.version;
				});
		}
	});

	afterNavigate(() => {
		repl?.set({
			files: data.gist.components
		});
	});

	const svelteUrl = $derived(
		browser && version === 'local'
			? `${location.origin}/repl/local`
			: `https://unpkg.com/svelte@${version}`
	);

	const relaxed = $derived(data.gist.relaxed || (data.user && data.user.id === data.gist.owner));
</script>

<svelte:head>
	<title>{data.gist.name} • REPL • Svelte</title>

	<meta name="twitter:title" content="{data.gist.name} • REPL • Svelte" />
	<meta name="twitter:description" content="Cybernetically enhanced web apps" />
	<meta name="Description" content="Interactive Svelte playground" />
</svelte:head>

<div class="repl-outer">
	{#if browser}
		<Repl
			bind:this={repl}
			{svelteUrl}
			{relaxed}
			injectedJS={mapbox_setup}
			showModified
			showAst
			previewTheme={$theme.current}
			embedded
			vim={false}
		/>
	{/if}
</div>

<style>
	.repl-outer {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: var(--sk-back-1);
		overflow: hidden;
		box-sizing: border-box;
		--pane-controls-h: 4.2rem;
		display: flex;
		flex-direction: column;
	}
</style>
