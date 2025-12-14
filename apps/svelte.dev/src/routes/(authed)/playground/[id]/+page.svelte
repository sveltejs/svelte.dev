<script lang="ts">
	// @ts-expect-error no types
	import * as doNotZip from 'do-not-zip';
	import { browser } from '$app/environment';
	import { afterNavigate, goto, replaceState } from '$app/navigation';
	import type { Gist } from '$lib/db/types';
	import { Repl } from '@sveltejs/repl';
	import { theme } from '@sveltejs/site-kit/state';
	import { mapbox_setup } from '../../../../config.js';
	import AppControls from './AppControls.svelte';
	import { compress_and_encode_text, decode_and_decompress_text } from './gzip.js';
	import { page } from '$app/state';
	import type { File } from '@sveltejs/repl/workspace';

	let { data } = $props();

	const STORAGE_KEY = 'svelte:playground';

	let repl = $state() as ReturnType<typeof Repl>;
	// svelte-ignore state_referenced_locally
	let name = $state(data.gist.name);
	let modified = $state(false);
	let setting_hash: any = null;

	let version = $derived(page.url.searchParams.get('version') || 'latest');

	// Hashed URLs are less safe (we can't delete malicious REPLs), therefore
	// don't allow links to escape the sandbox restrictions
	const can_escape = browser && !page.url.hash;

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
				files: JSON.parse(JSON.stringify(data.gist.components)).map(munge),
				tailwind: false // TODO
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

			repl.set({ files, tailwind: recovered.tailwind ?? false, aliases: recovered.aliases });
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

	async function download() {
		const { files: components, imports } = repl.toJSON();

		const files: Array<{ path: string; data: string }> = await (
			await fetch('/svelte-template.json')
		).json();

		if (imports.length > 0) {
			const idx = files.findIndex(({ path }) => path === 'package.json');
			const pkg = JSON.parse(files[idx].data);
			const { devDependencies } = pkg;
			imports.forEach((mod) => {
				const match = /^(@[^/]+\/)?[^@/]+/.exec(mod)!;
				devDependencies[match[0]] = 'latest';
			});
			pkg.devDependencies = devDependencies;
			files[idx].data = JSON.stringify(pkg, null, '  ');
		}

		files.push(
			...components.map((component) => ({
				path: `src/routes/${component.name}`,
				data: (component as File).contents
			}))
		);

		const url = URL.createObjectURL(doNotZip.toBlob(files));
		const link = document.createElement('a');
		link.href = url;
		link.download = 'svelte-app.zip';
		link.style.display = 'none';
		document.body.appendChild(link);
		link.click();
		URL.revokeObjectURL(url);
		link.remove();
	}

	async function update_hash() {
		// Only change hash when necessary to avoid polluting everyone's browser history
		if (modified) {
			const { files, tailwind } = repl.toJSON();
			const json = JSON.stringify({ name, files, tailwind });
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
	<meta name="description" content="Interactive Svelte playground" />
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
			const { files, tailwind } = repl.toJSON();
			const json = JSON.stringify({ name, files, tailwind });
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
				{download}
				previewTheme={theme.current}
				onversion={(v) => {
					if (version === (version = v)) return;

					const url = new URL(location.href);
					url.searchParams.set('version', v);

					replaceState(url, {});
				}}
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
