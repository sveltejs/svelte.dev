<script lang="ts">
	import { browser } from '$app/environment';
	import { afterNavigate, replaceState } from '$app/navigation';
	import { theme } from '@sveltejs/site-kit/state';
	import { Repl } from '@sveltejs/repl';
	import { mapbox_setup } from '../../../../../config.js';
	import { page } from '$app/state';
	import { decode_and_decompress_text } from '../gzip.js';
	import type { File } from '@sveltejs/repl/workspace';

	let { data } = $props();

	let repl = $state() as ReturnType<typeof Repl>;

	let version = $derived(page.url.searchParams.get('version') || 'latest');

	// TODO make this munging unnecessary
	function munge(data: any): File {
		const basename = `${data.name}.${data.type}`;

		return {
			type: 'file',
			name: basename,
			basename,
			contents: data.source,
			text: true
		};
	}

	async function set_files() {
		const hash = location.hash.slice(1);

		if (!hash) {
			repl?.set({
				files: data.gist.components.map(munge),
				tailwind: false // TODO
			});

			return;
		}

		try {
			const recovered = JSON.parse(await decode_and_decompress_text(hash));
			repl.set({ files: recovered.files, tailwind: recovered.tailwind ?? false });
		} catch {
			alert(`Couldn't load the code from the URL. Make sure you copied the link correctly.`);
		}
	}

	afterNavigate(() => {
		set_files();
	});

	const relaxed = $derived(data.gist.relaxed || (data.user && data.user.id === data.gist.owner));
</script>

<svelte:head>
	<title>{data.gist.name} • Playground • Svelte</title>

	<meta name="twitter:title" content="{data.gist.name} • Playground • Svelte" />
	<meta name="twitter:description" content="Web development for the rest of us" />
	<meta name="description" content="Interactive Svelte playground" />
</svelte:head>

<div class="repl-outer">
	{#if browser}
		<Repl
			bind:this={repl}
			svelteVersion={version}
			{relaxed}
			can_escape
			injectedJS={mapbox_setup}
			previewTheme={theme.current}
			embedded={page.url.searchParams.has('output-only') ? 'output-only' : true}
			onversion={(v) => {
				if (version === v) return;

				const url = new URL(location.href);
				url.searchParams.set('version', v);

				replaceState(url, {});
			}}
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
