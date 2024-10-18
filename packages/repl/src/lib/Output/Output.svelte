<script lang="ts">
	import { marked } from 'marked';
	import AstView from './AstView.svelte';
	import CompilerOptions from './CompilerOptions.svelte';
	import PaneWithPanel from './PaneWithPanel.svelte';
	import Viewer from './Viewer.svelte';
	import { Editor, Workspace, type File } from 'editor';
	import { untrack } from 'svelte';

	interface Props {
		status: string | null;
		runtimeError?: Error | null;
		embedded?: boolean;
		relaxed?: boolean;
		can_escape?: boolean;
		injectedJS: string;
		injectedCSS: string;
		previewTheme: 'light' | 'dark';
		workspace: Workspace;
	}

	let {
		status,
		runtimeError = $bindable(null),
		embedded = false,
		relaxed = false,
		can_escape = false,
		injectedJS,
		injectedCSS,
		previewTheme,
		workspace
	}: Props = $props();

	let view: 'result' | 'js' | 'css' | 'ast' = $state('result');

	const js: File = {
		type: 'file',
		name: 'output.js',
		basename: 'output.js',
		contents: '',
		text: true
	};

	const css: File = {
		type: 'file',
		name: 'output.css',
		basename: 'output.css',
		contents: '',
		text: true
	};

	const js_workspace = new Workspace([js], {
		readonly: true
	});

	const css_workspace = new Workspace([css], {
		readonly: true
	});

	let is_markdown = $derived(workspace.current.name.endsWith('.md'));

	let markdown = $derived(is_markdown ? (marked.parse(workspace.current!.contents) as string) : '');

	let current = $derived(workspace.compiled[workspace.current.name!]);

	// TODO this effect is a bit of a code smell
	$effect(() => {
		if (current) {
			if (current.error) {
				js.contents = css.contents = `/* ${current.error.message} */`;
			} else {
				js.contents = current.result.js.code;
				css.contents =
					current.result.css?.code ?? `/* Add a <st` + `yle> tag to see the CSS output */`;
			}
		} else {
			js.contents = css.contents = `/* Select a component to see its compiled code */`;
		}

		// TODO the untrack should probably go in update_file
		untrack(() => {
			js_workspace.update_file(js);
			css_workspace.update_file(css);
		});
	});

	let ast = $derived(current?.result?.ast);
</script>

<div class="view-toggle">
	{#if workspace.current.name.endsWith('.md')}
		<button class="active">Markdown</button>
	{:else}
		<button class:active={view === 'result'} onclick={() => (view = 'result')}>Result</button>
		<button class:active={view === 'js'} onclick={() => (view = 'js')}>JS output</button>
		<button class:active={view === 'css'} onclick={() => (view = 'css')}>CSS output</button>
		<button class:active={view === 'ast'} onclick={() => (view = 'ast')}>AST output</button>
	{/if}
</div>

<!-- component viewer -->
<div class="tab-content" class:visible={!is_markdown && view === 'result'}>
	<Viewer
		bind:error={runtimeError}
		{status}
		{relaxed}
		{can_escape}
		{injectedJS}
		{injectedCSS}
		theme={previewTheme}
	/>
</div>

<!-- js output -->
<div class="tab-content" class:visible={!is_markdown && view === 'js'}>
	{#if embedded}
		<Editor workspace={js_workspace} />
	{:else}
		<PaneWithPanel pos="50%" panel="Compiler options">
			<div slot="main">
				<Editor workspace={js_workspace} />
			</div>

			<div slot="panel-body">
				<CompilerOptions {workspace} />
			</div>
		</PaneWithPanel>
	{/if}
</div>

<!-- css output -->
<div class="tab-content" class:visible={!is_markdown && view === 'css'}>
	<Editor workspace={css_workspace} />
</div>

<!-- ast output -->
{#if ast}
	<div class="tab-content" class:visible={!is_markdown && view === 'ast'}>
		<AstView {ast} autoscroll={!is_markdown && view === 'ast'} />
	</div>
{/if}

<!-- markdown output -->
<div class="tab-content" class:visible={is_markdown}>
	<iframe title="Markdown" srcdoc={markdown}></iframe>
</div>

<style>
	.view-toggle {
		height: var(--sk-pane-controls-height);
		overflow: hidden;
		white-space: nowrap;
		box-sizing: border-box;

		/* fake border (allows tab borders to appear above it) */
		&::before {
			content: '';
			position: absolute;
			width: 100%;
			height: 1px;
			bottom: 0px;
			left: 0;
			background-color: var(--sk-back-4);
		}
	}

	button {
		height: 100%;
		background: transparent;
		text-align: left;
		position: relative;
		font: var(--sk-font-ui-small); /* TODO should probably be a global button style */
		border: none;
		border-bottom: 1px solid transparent;
		padding: 0 1rem;
		color: var(--sk-text-2, #999);
		border-radius: 0;
	}

	button.active {
		border-bottom: 1px solid var(--sk-theme-1, --prime);
		color: var(--sk-text-1, #333);
	}

	div[slot] {
		height: 100%;
	}

	.tab-content {
		position: absolute;
		width: 100%;
		height: calc(100% - var(--sk-pane-controls-height)) !important;
		visibility: hidden;
		pointer-events: none;
	}

	.tab-content.visible {
		visibility: visible;
		pointer-events: all;
	}

	iframe {
		width: 100%;
		height: 100%;
		border: none;
		display: block;
	}
</style>
