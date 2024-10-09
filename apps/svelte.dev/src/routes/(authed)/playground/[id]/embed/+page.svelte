<script lang="ts">
	import { browser } from '$app/environment';
	import { afterNavigate, replaceState } from '$app/navigation';
	import { theme } from '@sveltejs/site-kit/stores';
	import { Repl } from '@sveltejs/repl';
	import { mapbox_setup } from '../../../../../config.js';
	import { onMount } from 'svelte';

	let { data } = $props();

	let repl = $state() as Repl;

	onMount(() => {
		if (data.version !== 'local') {
			fetch(`https://unpkg.com/svelte@${data.version}/package.json`)
				.then((r) => r.json())
				.then((pkg) => {
					if (pkg.version !== data.version) {
						replaceState(`/playground/${data.gist.id}/embed?version=${pkg.version}`, {});
					}
				});
		}
	});

	afterNavigate(() => {
		repl?.set({
			files: data.gist.components
		});
	});

	const svelteUrl =
		browser && data.version === 'local'
			? `${location.origin}/playground/local`
			: `https://unpkg.com/svelte@${data.version}`;

	const relaxed = $derived(data.gist.relaxed || (data.user && data.user.id === data.gist.owner));
</script>

<svelte:head>
	<title>{data.gist.name} • Playground • Svelte</title>

	<meta name="twitter:title" content="{data.gist.name} • Playground • Svelte" />
	<meta name="twitter:description" content="Web development, but fun" />
	<meta name="Description" content="Interactive Svelte playground" />
</svelte:head>

<div class="repl-outer">
	{#if browser}
		<Repl
			bind:this={repl}
			{svelteUrl}
			{relaxed}
			can_escape
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
