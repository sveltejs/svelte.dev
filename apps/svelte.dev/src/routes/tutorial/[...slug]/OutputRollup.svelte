<script lang="ts">
	import { browser } from '$app/environment';
	import Viewer from '@sveltejs/repl/viewer';
	import { Console, type Log } from '@sveltejs/repl/console';
	import { theme } from '@sveltejs/site-kit/state';
	import Chrome from './Chrome.svelte';
	import Loading from './Loading.svelte';
	import { adapter_state, update } from './adapter.svelte';
	import { SplitPane, type Length } from '@rich_harris/svelte-split-pane';
	import { Spring } from 'svelte/motion';

	let terminal_visible = $state(false);
	let logs = $state<Log[]>([]);

	let last_pos = 20;
	let pos = Spring.of(() => (terminal_visible ? last_pos : 100));
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
	toggle_terminal={() => {
		if (terminal_visible) {
			last_pos = pos.current;
		}

		terminal_visible = !terminal_visible;
	}}
/>

<div class="content">
	<SplitPane
		min="50px"
		type="columns"
		disabled={!terminal_visible}
		max={terminal_visible ? '80%' : '100%'}
		bind:pos={() => (pos.current + '%') as Length, (v) => pos.set(parseFloat(v), { instant: true })}
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
			<div class="terminal">
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

	@media (prefers-color-scheme: dark) {
		.terminal {
			background: rgba(0, 0, 0, 0.5);
		}
	}
</style>
