<script lang="ts">
	import { browser } from '$app/environment';
	import { afterNavigate, goto, replaceState } from '$app/navigation';
	import type { Gist } from '$lib/db/types';
	import { Repl } from '@sveltejs/repl';
	import { theme } from '@sveltejs/site-kit/stores';
	import { mapbox_setup } from '../../../../config.js';
	import AppControls from './AppControls.svelte';
	import { compress_and_encode_text, decode_and_decompress_text } from './gzip.js';
	import { page } from '$app/stores';
	import type { File } from 'editor';

	let { data } = $props();

	const STORAGE_KEY = 'svelte:playground';

	let repl = $state() as ReturnType<typeof Repl>;
	let name = $state(data.gist.name);
	let modified = $state(false);
	let setting_hash: any = null;

	// svelte-ignore non_reactive_update
	let version = $page.url.searchParams.get('version') || 'latest';
	let is_pr_or_commit_version = version.startsWith('pr-') || version.startsWith('commit-');

	// Hashed URLs are less safe (we can't delete malicious REPLs), therefore
	// don't allow links to escape the sandbox restrictions
	const can_escape = browser && !$page.url.hash;

	if (version !== 'local' && !is_pr_or_commit_version) {
		$effect(() => {
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
		});
	}

	afterNavigate(() => {
		name = data.gist.name;
		set_files();
	});

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
		const saved = sessionStorage.getItem(STORAGE_KEY);
		const hash = location.hash.slice(1);

		if (!hash && !saved) {
			repl?.set({
				// TODO make this munging unnecessary (using JSON instead of structuredClone for better browser compat)
				files: JSON.parse(JSON.stringify(data.gist.components)).map(munge)
			});

			modified = false;
			return;
		}

		try {
			const recovered = JSON.parse(saved ?? (await decode_and_decompress_text(hash)));
			let files = recovered.files;

			if (files[0]?.source) {
				files = files.map(munge);
			}

			// older hashes may be missing a name
			if (recovered.name) {
				name = recovered.name;
			}

			repl.set({ files });
		} catch {
			alert(`Couldn't load the code from the URL. Make sure you copied the link correctly.`);
		}

		if (saved) {
			sessionStorage.removeItem(STORAGE_KEY);
			set_hash(saved);
		}
	}

	function handle_fork({ gist }: { gist: Gist }) {
		goto(`/playground/${gist.id}?version=${version}`);
	}

	function handle_save() {
		// Hide hash from URL
		const hash = location.hash.slice(1);
		if (hash) {
			set_hash();
		}
	}

	async function update_hash() {
		// Only change hash when necessary to avoid polluting everyone's browser history
		if (modified) {
			const json = JSON.stringify({ name, files: repl.toJSON().files });
			await set_hash(json);
		}
	}

	async function set_hash(hash?: string) {
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

	function onchange() {
		const was_modified = modified;
		modified = true;

		if (
			!was_modified &&
			modified &&
			name === data.gist.name &&
			data.examples.some((section) =>
				section.examples.some((example) => example.slug === data.gist.id)
			)
		) {
			name = `${name} (edited)`;
		}
	}

	const relaxed = $derived(data.gist.relaxed || (data.user && data.user.id === data.gist.owner));
</script>

<svelte:head>
	<title>{name} • Playground • Svelte</title>

	<meta name="twitter:title" content="{data.gist.name} • Playground • Svelte" />
	<meta name="twitter:description" content="Web development for the rest of us" />
	<meta name="Description" content="Interactive Svelte playground" />
</svelte:head>

<svelte:window
	onhashchange={() => {
		if (!setting_hash) {
			set_files();
		}
	}}
	onbeforeunload={() => {
		if (modified) {
			// we can't save to the hash because it's an async operation, so we use
			// a short-lived sessionStorage value instead
			const json = JSON.stringify({ name, files: repl.toJSON().files });
			sessionStorage.setItem(STORAGE_KEY, json);
		}
	}}
/>

<svelte:body onmouseleave={update_hash} />

<div class="repl-outer">
	<AppControls
		examples={data.examples}
		user={data.user}
		gist={data.gist}
		forked={handle_fork}
		saved={handle_save}
		{repl}
		bind:name
		bind:modified
	/>

	{#if browser}
		<div style="display: contents" onfocusout={update_hash}>
			<Repl
				bind:this={repl}
				svelteVersion={version}
				{relaxed}
				{can_escape}
				injectedJS={mapbox_setup}
				{onchange}
				previewTheme={$theme.current}
			/>
		</div>
	{/if}
</div>

<style>
	.repl-outer {
		position: relative;
		height: calc(100% - var(--sk-nav-height) - var(--sk-banner-height));
		height: calc(100dvh - var(--sk-nav-height) - var(--sk-banner-height));
		overflow: hidden;
		background-color: var(--sk-bg-1);
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
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

	@keyframes fade-in {
		0% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
	}
</style>
