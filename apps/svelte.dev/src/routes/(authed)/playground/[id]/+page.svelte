<script lang="ts">
	import { browser } from '$app/environment';
	import { afterNavigate, goto, replaceState } from '$app/navigation';
	import type { Gist } from '$lib/db/types';
	import { Repl, type File } from '@sveltejs/repl';
	import { theme } from '@sveltejs/site-kit/stores';
	import { onMount } from 'svelte';
	import { mapbox_setup } from '../../../../config.js';
	import AppControls from './AppControls.svelte';
	import { compress_and_encode_text, decode_and_decompress_text } from './gzip.js';
	import { page } from '$app/stores';

	let { data } = $props();

	let repl = $state() as Repl;
	let name = $state(data.gist.name);
	let zen_mode = $state(false);
	let modified_count = $state(0);
	let version = data.version;
	let setting_hash: any = null;

	// Hashed URLs are less safe (we can't delete malicious REPLs), therefore
	// don't allow links to escape the sandbox restrictions
	const can_escape = browser && !$page.url.hash;

	onMount(() => {
		if (version !== 'local') {
			fetch(`https://unpkg.com/svelte@${version}/package.json`)
				.then((r) => r.json())
				.then((pkg) => {
					if (pkg.version !== version) {
						version = pkg.version;

						let url = `/playground/${data.gist.id}?version=${version}`;
						if (location.hash) {
							url += location.hash;
						}
						replaceState(url, {});
					}
				});
		}
	});

	afterNavigate(() => {
		name = data.gist.name;
		set_files();
	});

	async function set_files() {
		const hash = location.hash.slice(1);

		if (!hash) {
			repl?.set({
				files: data.gist.components
			});

			return;
		}

		try {
			const files = JSON.parse(await decode_and_decompress_text(hash)).files;
			repl.set({ files });
		} catch {
			alert(`Couldn't load the code from the URL. Make sure you copied the link correctly.`);
		}
	}

	function handle_fork({ gist }: { gist: Gist }) {
		goto(`/playground/${gist.id}?version=${version}`);
	}

	function handle_save() {
		// Hide hash from URL
		const hash = location.hash.slice(1);
		if (hash) {
			change_hash();
		}
	}

	async function change_hash(hash?: string) {
		let url = `${location.pathname}${location.search}`;
		if (hash) {
			url += `#${await compress_and_encode_text(hash)}`;
		}

		clearTimeout(setting_hash);
		replaceState(url, {});
		setting_hash = setTimeout(() => {
			setting_hash = null;
		}, 500);
	}

	function handle_change({ files }: { files: File[] }) {
		const old_count = modified_count;
		modified_count = files.filter((c) => c.modified).length;

		if (
			old_count === 0 &&
			modified_count > 0 &&
			name === data.gist.name &&
			data.examples.some((section) =>
				section.examples.some((example) => example.slug === data.gist.id)
			)
		) {
			name = `${name} (edited)`;
		}
	}

	const svelteUrl =
		browser && version === 'local'
			? `${location.origin}/playground/local`
			: `https://unpkg.com/svelte@${version}`;

	const relaxed = $derived(data.gist.relaxed || (data.user && data.user.id === data.gist.owner));
</script>

<svelte:head>
	<title>{name} • Playground • Svelte</title>

	<meta name="twitter:title" content="{data.gist.name} • Playground • Svelte" />
	<meta name="twitter:description" content="Web development, but fun" />
	<meta name="Description" content="Interactive Svelte playground" />
</svelte:head>

<svelte:window
	on:hashchange={() => {
		if (!setting_hash) {
			set_files();
		}
	}}
/>

<div class="repl-outer {zen_mode ? 'zen-mode' : ''}">
	<AppControls
		examples={data.examples}
		user={data.user}
		gist={data.gist}
		forked={handle_fork}
		saved={handle_save}
		{repl}
		bind:name
		bind:zen_mode
		bind:modified_count
	/>

	{#if browser}
		<Repl
			bind:this={repl}
			{svelteUrl}
			{relaxed}
			{can_escape}
			vim={data.vim}
			injectedJS={mapbox_setup}
			showModified
			showAst
			change={handle_change}
			add={handle_change}
			remove={handle_change}
			blur={() => {
				// Only change hash on editor blur to not pollute everyone's browser history
				if (modified_count !== 0) {
					const json = JSON.stringify({ files: repl.toJSON().files });
					change_hash(json);
				}
			}}
			previewTheme={$theme.current}
		/>
	{/if}
</div>

<style>
	.repl-outer {
		position: relative;
		height: calc(100% - var(--sk-nav-height) - var(--sk-banner-bottom-height));
		height: calc(100dvh - var(--sk-nav-height) - var(--sk-banner-bottom-height));
		--app-controls-h: 5rem;
		--pane-controls-h: 4.2rem;
		overflow: hidden;
		background-color: var(--sk-back-1);
		padding: var(--app-controls-h) 0 0 0;
		/* margin: 0 calc(var(--side-nav) * -1); */
		box-sizing: border-box;
		display: flex;
		flex-direction: column;

		@media (min-width: 800px) {
			--app-controls-h: 6rem;
		}
	}

	/* temp fix for #2499 and #2550 while waiting for a fix for https://github.com/sveltejs/svelte-repl/issues/8 */

	.repl-outer :global(.tab-content),
	.repl-outer :global(.tab-content.visible) {
		pointer-events: all;
		opacity: 1;
	}
	.repl-outer :global(.tab-content) {
		visibility: hidden;
	}
	.repl-outer :global(.tab-content.visible) {
		visibility: visible;
	}

	.zen-mode {
		position: fixed;
		width: 100%;
		height: 100%;
		top: 0;
		z-index: 111;
	}

	@keyframes fade-in {
		0% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
	}
</style>
