<script module>
	let initial = $state(true);
</script>

<script lang="ts">
	import { browser, dev } from '$app/environment';
	import { afterNavigate } from '$app/navigation';
	import { theme, type Theme } from '@sveltejs/site-kit/stores';
	import { onMount } from 'svelte';
	import Chrome from './Chrome.svelte';
	import Loading from './Loading.svelte';
	import { adapter_state, subscribe } from './adapter.svelte';
	import type { Exercise } from '$lib/tutorial';

	interface Props {
		exercise: Exercise;
		paused: boolean;
	}

	let { exercise, paused }: Props = $props();

	let iframe = $state() as HTMLIFrameElement;
	let loading = $state(true);
	let terminal_visible = $state(false);

	// reset `path` to `exercise.path` each time, but allow it to be controlled by the iframe
	let path = $state(exercise.path);

	onMount(() => {
		const unsubscribe = subscribe('reload', () => {
			set_iframe_src(adapter_state.base + path);
		});

		return () => {
			initial = false;
			unsubscribe();
		};
	});

	afterNavigate(() => {
		clearTimeout(timeout);
	});

	function change_theme(theme: Theme) {
		if (!iframe) return;

		try {
			const url = new URL(iframe.src);

			url.searchParams.set('theme', theme.current);

			iframe.src = url.href;
		} catch {}
	}

	let timeout: any;

	async function handle_message(e: MessageEvent) {
		if (e.origin !== adapter_state.base) return;

		if (paused) return;

		if (e.data.type === 'path') {
			path = e.data.path;
		} else if (e.data.type === 'ping') {
			loading = false;

			clearTimeout(timeout);
			timeout = setTimeout(() => {
				if (dev && !iframe) return;

				// we lost contact, refresh the page
				loading = true;
				set_iframe_src(adapter_state.base + path);
				loading = false;
			}, 1000);
		} else if (e.data.type === 'ping-pause') {
			clearTimeout(timeout);
		}
	}

	function set_iframe_src(src: string) {
		if (!iframe) return; // HMR

		// To prevent iframe flickering.
		// Set to `visible` by calling `set_iframe_visible` function
		// from iframe on:load or setTimeout
		iframe.style.visibility = 'hidden';
		setTimeout(set_iframe_visible, 1000);

		// removing the iframe from the document allows us to
		// change the src without adding a history entry, which
		// would make back/forward traversal very annoying
		const parentNode = /** @type {HTMLElement} */ (iframe.parentNode);
		parentNode?.removeChild(iframe);

		const url = new URL(src);
		url.searchParams.set('theme', $theme.current);

		iframe.src = url.href;
		parentNode?.appendChild(iframe);
	}

	function set_iframe_visible() {
		if (iframe?.style.visibility === 'hidden') {
			iframe.style.visibility = 'visible';
		}
	}

	$effect(() => {
		if (adapter_state.base) set_iframe_src(adapter_state.base + (path = exercise.path));
	});
	$effect(() => {
		change_theme($theme);
	});
</script>

<svelte:window onmessage={handle_message} />
<Chrome
	{path}
	{loading}
	href={adapter_state.base && adapter_state.base + path}
	refresh={() => {
		set_iframe_src(adapter_state.base + path);
	}}
	toggle_terminal={() => {
		terminal_visible = !terminal_visible;
	}}
	change={(e) => {
		if (adapter_state.base) {
			const url = new URL(e.value, adapter_state.base);
			path = url.pathname + url.search + url.hash;
			set_iframe_src(adapter_state.base + path);
		}
	}}
/>

<div class="content">
	{#if browser}
		<iframe bind:this={iframe} title="Output" onload={set_iframe_visible}></iframe>
	{/if}

	{#if paused || loading || adapter_state.error}
		<Loading
			{initial}
			error={adapter_state.error}
			progress={adapter_state.progress.value}
			status={adapter_state.progress.text}
		/>
	{/if}

	<div class="terminal" class:visible={terminal_visible}>
		{#each adapter_state.logs as log}
			<div>{@html log}</div>
		{/each}
	</div>
</div>

<style>
	.content {
		display: flex;
		flex-direction: column;
		position: relative;
		min-height: 0;
		height: 100%;
		max-height: 100%;
		background: var(--sk-back-2);
		--menu-width: 5.4rem;
	}

	iframe {
		width: 100%;
		height: 100%;
		flex: 1;
		resize: none;
		box-sizing: border-box;
		border: none;
		background: var(--sk-back-2);
	}

	.terminal {
		position: absolute;
		left: 0;
		bottom: 0;
		width: 100%;
		height: 80%;
		font-family: var(--sk-font-mono);
		font-size: var(--sk-font-size-ui-small); /* TODO this should use a mono size */
		padding: 1rem;
		border-top: 1px solid var(--sk-text-4);
		background: rgba(255, 255, 255, 0.5);
		transform: translate(0, 100%);
		transition: transform 0.3s;
		backdrop-filter: blur(3px);
		overflow-y: auto;
	}

	.terminal::after {
		--thickness: 6px;
		--shadow: transparent;
		content: '';
		display: block;
		position: absolute;
		width: 100%;
		height: var(--thickness);
		left: 0;
		top: calc(-1 * var(--thickness));
		background-image: linear-gradient(to bottom, transparent, var(--shadow));
		pointer-events: none;
	}

	.terminal.visible {
		transform: none;
	}

	.terminal.visible::after {
		--shadow: rgba(0, 0, 0, 0.05);
	}

	@media (prefers-color-scheme: dark) {
		.terminal {
			background: rgba(0, 0, 0, 0.5);
		}
	}
</style>
