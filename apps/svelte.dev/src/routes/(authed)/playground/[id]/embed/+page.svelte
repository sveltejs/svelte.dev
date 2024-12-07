<script lang="ts">
	import { browser } from '$app/environment';
	import { afterNavigate, replaceState } from '$app/navigation';
	import { theme } from '@sveltejs/site-kit/stores';
	import { Repl } from '@sveltejs/repl';
	import { mapbox_setup } from '../../../../../config.js';
	import { page } from '$app/stores';

	let { data } = $props();

	let repl = $state() as ReturnType<typeof Repl>;

	// svelte-ignore non_reactive_update
	let version = $page.url.searchParams.get('version') || 'latest';
	let is_pr_or_commit_version = version.startsWith('pr-') || version.startsWith('commit-');

	if (version !== 'local' && !is_pr_or_commit_version) {
		$effect(() => {
			fetch(`https://unpkg.com/svelte@${version}/package.json`)
				.then((r) => r.json())
				.then((pkg) => {
					if (pkg.version !== data.version) {
						replaceState(`/playground/${data.gist.id}/embed?version=${pkg.version}`, {});
					}
				});
		});
	}

	afterNavigate(() => {
		repl?.set({
			files: data.gist.components
		});
	});

	const relaxed = $derived(data.gist.relaxed || (data.user && data.user.id === data.gist.owner));
</script>

<svelte:head>
	<title>{data.gist.name} • Playground • Svelte</title>

	<meta name="twitter:title" content="{data.gist.name} • Playground • Svelte" />
	<meta name="twitter:description" content="Web development for the rest of us" />
	<meta name="Description" content="Interactive Svelte playground" />
</svelte:head>

<div class="repl-outer">
	{#if browser}
		<Repl
			bind:this={repl}
			svelteVersion={version}
			{relaxed}
			can_escape
			injectedJS={mapbox_setup}
			previewTheme={$theme.current}
			embedded
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
		background-color: var(--sk-bg-1);
		overflow: hidden;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
	}
</style>
