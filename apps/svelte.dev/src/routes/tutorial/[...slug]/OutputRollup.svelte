<script lang="ts">
	import { browser } from '$app/environment';
	import Viewer from '@sveltejs/repl/viewer';
	import { Console, type Log } from '@sveltejs/repl/console';
	import { theme } from '@sveltejs/site-kit/state';
	import Chrome from './Chrome.svelte';
	import Loading from './Loading.svelte';
	import { adapter_state, update } from './adapter.svelte';
	import { SplitPane } from '@rich_harris/svelte-split-pane';

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
	<SplitPane
		min="50px"
	  type="vertical"
		max={terminal_visible ? '80%' : '100%'}
		pos={terminal_visible ? '20%' : '100%' }
	>
		{#snippet a()}
		{#if browser}
		<Viewer
			relaxed
			can_escape
			onLog={(l: Log[]) => (logs = l)}
			bundler={adapter_state.bundler}
			theme={theme.current}
			injectedCSS="@import '/tutorial/shared.css';"
			error={null}
			status={null}
		/>
	{/if}

	{#if adapter_state.progress.value !== 1}
		<Loading
			initial={false}
			progress={adapter_state.progress.value}
			status={adapter_state.progress.text}
		/>
	{/if}
	{/snippet}

	{#snippet b()}
		<div class="terminal" class:visible={terminal_visible}>
			<Console {logs} />
		</div>
	{/snippet}
</SplitPane>
</div>

<style>
	.content {
		display: flex;
		flex-direction: column;
		position: relative;
		min-height: 0;
		height: 100%;
		max-height: 100%;
		background: var(--sk-bg-2);
		--menu-width: 5.4rem;
	}

	.terminal {
		position: relative;
		width: 100%;
		height: 100%;
		font: var(--sk-font-mono);
		background: var(--sk-bg-1);
		border-top: 1px solid var(--sk-border);
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
		-webkit-transform: none;
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
