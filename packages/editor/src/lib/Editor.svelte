<script lang="ts">
	import { BROWSER } from 'esm-env';
	import { acceptCompletion } from '@codemirror/autocomplete';
	import { indentWithTab } from '@codemirror/commands';
	import { html } from '@codemirror/lang-html';
	import { javascript } from '@codemirror/lang-javascript';
	import { indentUnit } from '@codemirror/language';
	import { setDiagnostics } from '@codemirror/lint';
	import { EditorState } from '@codemirror/state';
	import { EditorView, keymap } from '@codemirror/view';
	import { svelte } from '@replit/codemirror-lang-svelte';
	import { theme } from './theme';
	import { basicSetup } from 'codemirror';
	import { autocomplete_for_svelte } from '@sveltejs/site-kit/codemirror';
	import type { Diagnostic } from '@codemirror/lint';
	import { Workspace, type Item, type File } from './Workspace.svelte.js';
	import './codemirror.css';

	interface Props {
		workspace: Workspace;
		readonly?: boolean;
		onchange?: (file: File, contents: string) => void;
		autocomplete_filter?: (file: File) => boolean;
	}

	let { workspace, readonly = false, onchange, autocomplete_filter = () => true }: Props = $props();

	let container: HTMLDivElement;

	let preserve_editor_focus = $state(false);

	let remove_focus_timeout = $state<any>();

	let editor_states = new Map<string, EditorState>();

	let editor_view = $state() as EditorView;

	const extensions = [
		basicSetup,
		EditorState.tabSize.of(2),
		keymap.of([{ key: 'Tab', run: acceptCompletion }, indentWithTab]),
		indentUnit.of('\t'),
		theme
	];

	let installed_vim = false;

	export async function update_files(files: Item[]) {
		let should_install_vim = localStorage.getItem('vim') === 'true';

		const q = new URLSearchParams(location.search);
		if (q.has('vim')) {
			should_install_vim = q.get('vim') === 'true';
			localStorage.setItem('vim', should_install_vim.toString());
		}

		if (!installed_vim && should_install_vim) {
			installed_vim = true;
			const { vim } = await import('@replit/codemirror-vim');
			extensions.push(vim());
		}

		for (const file of files) {
			if (file.type !== 'file') continue;

			let state = editor_states.get(file.name);

			if (state) {
				const existing = state.doc.toString();

				if (file.contents !== existing) {
					const transaction = state.update({
						changes: {
							from: 0,
							to: existing.length,
							insert: file.contents
						}
					});

					editor_states.set(file.name, transaction.state);
					state = transaction.state;

					if (workspace.selected_name === file.name) {
						editor_view.setState(state);
					}
				}
			} else {
				let lang;

				if (file.name.endsWith('.js') || file.name.endsWith('.json')) {
					lang = [javascript()];
				} else if (file.name.endsWith('.html')) {
					lang = [html()];
				} else if (file.name.endsWith('.svelte')) {
					lang = [
						svelte(),
						...autocomplete_for_svelte(
							() => workspace.selected_name!,
							() =>
								files
									.filter((file) => {
										if (file.type !== 'file') return false;
										return autocomplete_filter(file);
									})
									.map((file) => file.name)
						)
					];
				}

				state = EditorState.create({
					doc: file.contents,
					extensions: [
						...extensions,
						...(lang || []),
						EditorState.readOnly.of(readonly),
						EditorView.editable.of(!readonly)
					]
				});

				editor_states.set(file.name, state);
			}
		}
	}

	/**
	 * Wipe the editor state clean, including all undo/redo history.
	 * Typically this only happens when navigating, not when
	 * updating files in-situ
	 */
	export async function reset() {
		editor_states.clear();
		await update_files(workspace.files);
		select_state(workspace.selected_name);
	}

	function select_state(selected_name: string | null) {
		const state =
			(selected_name && editor_states.get(selected_name)) ||
			EditorState.create({
				doc: '',
				extensions: [EditorState.readOnly.of(true)]
			});

		editor_view.setState(state);
	}

	$effect(() => {
		editor_view = new EditorView({
			parent: container,
			async dispatch(transaction) {
				editor_view.update([transaction]);

				if (transaction.docChanged && workspace.selected_file) {
					onchange?.(workspace.selected_file, editor_view.state.doc.toString());

					// keep `editor_states` updated so that undo/redo history is preserved for files independently
					editor_states.set(workspace.selected_file.name, editor_view.state);
				}
			}
		});

		return () => {
			editor_view.destroy();
		};
	});

	$effect(() => {
		select_state(workspace.selected_name);
	});

	$effect(() => {
		// TODO we end up back here when we edit inside this component,
		// which is... fine but would be nice to avoid
		update_files(workspace.files);
	});

	$effect(() => {
		if (!workspace.selected_name) return;

		const diagnostics: Diagnostic[] = [];

		const error = workspace.compiled[workspace.selected_name]?.error;
		const current_warnings = workspace.compiled[workspace.selected_name]?.result?.warnings ?? [];

		if (error) {
			diagnostics.push({
				severity: 'error',
				from: error.position![0],
				to: error.position![1],
				message: error.message,
				renderMessage: () => {
					const span = document.createElement('span');
					span.innerHTML = `${error.message
						.replace(/&/g, '&amp;')
						.replace(/</g, '&lt;')
						.replace(/`(.+?)`/g, `<code>$1</code>`)} <strong>(${error.code})</strong>`;

					return span;
				}
			});
		}

		for (const warning of current_warnings) {
			diagnostics.push({
				severity: 'warning',
				from: warning.start!.character,
				to: warning.end!.character,
				message: warning.message,
				renderMessage: () => {
					const span = document.createElement('span');
					span.innerHTML = `${warning.message
						.replace(/&/g, '&amp;')
						.replace(/</g, '&lt;')
						.replace(/`(.+?)`/g, `<code>$1</code>`)} <strong>(${warning.code})</strong>`;

					return span;
				}
			});
		}

		const transaction = setDiagnostics(editor_view.state, diagnostics);
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
	{#if !BROWSER && workspace.selected_file}
		<div class="fake">
			<div class="fake-gutter">
				{#each workspace.selected_file.contents.split('\n') as _, i}
					<div class="fake-line">{i + 1}</div>
				{/each}
			</div>
			<div class="fake-content">
				{#each workspace.selected_file.contents.split('\n') as line}
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
