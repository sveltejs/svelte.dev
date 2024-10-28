<script lang="ts">
	import { BROWSER } from 'esm-env';
	import { setDiagnostics } from '@codemirror/lint';
	import { EditorView } from '@codemirror/view';
	import { Workspace, type File } from './Workspace.svelte.js';
	import './codemirror.css';

	interface Props {
		workspace: Workspace;
		autocomplete_filter?: (file: File) => boolean;
	}

	let { workspace, autocomplete_filter = () => true }: Props = $props();

	let container: HTMLDivElement;

	let preserve_editor_focus = $state(false);

	let remove_focus_timeout = $state<any>();

	let editor_view: EditorView;

	$effect(() => {
		editor_view = new EditorView({
			parent: container
		});

		workspace.link(editor_view);

		return () => {
			workspace.unlink(editor_view);
			editor_view.destroy();
		};
	});

	$effect(() => {
		const transaction = setDiagnostics(editor_view.state, workspace.diagnostics);
		editor_view.dispatch(transaction);
	});
</script>

<svelte:window
	onpointerdown={(e) => {
		if (!container.contains((e.target as HTMLElement))) {
			preserve_editor_focus = false;
		}
	}}
	onmessage={(e) => {
		if (preserve_editor_focus && e.data.type === 'iframe_took_focus') {
			editor_view.focus();
		}
	}}
/>

<div
	class="container"
	bind:this={container}
	onfocusin={() => {
		clearTimeout(remove_focus_timeout);
		preserve_editor_focus = true;
	}}
	onfocusout={() => {
		// Heuristic: user did refocus themmselves if iframe_took_focus
		// doesn't happen in the next few miliseconds. Needed
		// because else navigations inside the iframe refocus the editor.
		remove_focus_timeout = setTimeout(() => {
			preserve_editor_focus = false;
		}, 200);
	}}
>
	{#if !BROWSER && workspace.current}
		<div class="fake">
			<div class="fake-gutter">
				{#each workspace.current.contents.split('\n') as _, i}
					<div class="fake-line">{i + 1}</div>
				{/each}
			</div>
			<div class="fake-content">
				{#each workspace.current.contents.split('\n') as line}
					<pre>{line || ' '}</pre>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.container {
		width: 100%;
		height: 100%;
	}

	.fake {
		display: grid;
		grid-template-columns: 4rem 1fr;
		grid-gap: 1rem;
		padding: 1rem 0;
		font: var(--sk-font-mono);
	}

	.fake * {
		color: #ccc;
	}

	.fake-gutter {
		text-align: right;
		padding-right: 3px;
	}

	.fake-content {
		padding: 0 1rem;
	}

	@media (prefers-color-scheme: dark) {
		.fake * {
			color: #666;
		}
	}
</style>
