<script lang="ts">
	import { browser } from '$app/environment';
	// @ts-expect-error TODO types
	import Viewer from '@sveltejs/repl/viewer';
	// @ts-expect-error TODO types
	import Console, { type Log } from '@sveltejs/repl/console';
	import { theme } from '@sveltejs/site-kit/stores';
	import Chrome from './Chrome.svelte';
	import Loading from './Loading.svelte';
	import { adapter_state, update } from './adapter.svelte';
	import { toStore } from 'svelte/store';

	const bundle = toStore(() => adapter_state.bundle);

	let terminal_visible = $state(false);
	let logs = $state<Log[]>([]);
</script>

<Chrome
	refresh={() => {
		// Add bogus file to trigger a refresh
		update({
			text: true,
			type: 'file',
			basename: '__generated__.svelte',
			name: '__generated__.svelte',
			contents: ''
		});
	}}
	toggle_terminal={() => (terminal_visible = !terminal_visible)}
/>

<div class="content">
	{#if browser}
		<Viewer
			relaxed
			can_escape
			onLog={(l: Log[]) => logs = l}
			{bundle}
			theme={$theme.current}
			injectedCSS="@import '/tutorial/shared.css';"
		/>
	{/if}

	{#if adapter_state.progress.value !== 1}
		<Loading
			initial={false}
			progress={adapter_state.progress.value}
			status={adapter_state.progress.text}
		/>
	{/if}

	<div class="terminal" class:visible={terminal_visible}>
		<Console {logs} />
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

	.terminal {
		position: absolute;
		left: 0;
		bottom: 0;
		width: 100%;
		height: 80%;
		font: var(--sk-font-mono);
		padding: 1rem;
		background: var(--sk-back-1);
		border-top: 1px solid var(--sk-text-4);
		transform: translate(0, 100%);
		transition: transform 0.3s;
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
