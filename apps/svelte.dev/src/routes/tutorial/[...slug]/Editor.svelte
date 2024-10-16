<script lang="ts">
	import { browser } from '$app/environment';
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import { acceptCompletion } from '@codemirror/autocomplete';
	import { indentWithTab } from '@codemirror/commands';
	import { html } from '@codemirror/lang-html';
	import { javascript } from '@codemirror/lang-javascript';
	import { indentUnit } from '@codemirror/language';
	import { setDiagnostics } from '@codemirror/lint';
	import { EditorState } from '@codemirror/state';
	import { EditorView, keymap } from '@codemirror/view';
	import { svelte } from '@replit/codemirror-lang-svelte';
	import { svelteTheme } from '@sveltejs/repl/theme';
	import { basicSetup } from 'codemirror';
	import { onMount, tick } from 'svelte';
	import { workspace } from './state.svelte';
	import { autocomplete_for_svelte } from '@sveltejs/site-kit/codemirror';
	import type { Diagnostic } from '@codemirror/lint';
	import type { Exercise, Stub } from '$lib/tutorial';
	import type { Warning } from 'svelte/compiler';
	import './codemirror.css';

	interface Props {
		exercise: Exercise;
		warnings: Record<string, Warning[]>;
	}

	let { exercise, warnings }: Props = $props();

	let container = $state() as HTMLDivElement;

	let preserve_editor_focus = $state(false);
	let skip_reset = true;

	let remove_focus_timeout = $state<any>();

	let editor_states = new Map<string, EditorState>();

	let editor_view = $state() as EditorView;

	const extensions = [
		basicSetup,
		EditorState.tabSize.of(2),
		keymap.of([{ key: 'Tab', run: acceptCompletion }, indentWithTab]),
		indentUnit.of('\t'),
		svelteTheme
	];

	let installed_vim = false;

	async function reset(files: Stub[]) {
		if (skip_reset) return;

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
									.filter(
										(file) =>
											file.type === 'file' &&
											file.name.startsWith('/src') &&
											file.name.startsWith(exercise.scope.prefix) &&
											file.name !== '/src/__client.js' &&
											file.name !== '/src/app.html'
									)
									.map((file) => file.name)
						)
					];
				}

				state = EditorState.create({
					doc: file.contents,
					extensions: lang ? [...extensions, ...lang] : extensions
				});

				editor_states.set(file.name, state);
			}
		}
	}

	function select_state(selected_name: string | null) {
		if (skip_reset) return;

		const state =
			(selected_name && editor_states.get(selected_name)) ||
			EditorState.create({
				doc: '',
				extensions: [EditorState.readOnly.of(true)]
			});

		editor_view.setState(state);
	}

	onMount(() => {
		editor_view = new EditorView({
			parent: container,
			async dispatch(transaction) {
				editor_view.update([transaction]);

				if (transaction.docChanged && workspace.selected_file) {
					skip_reset = true;

					// TODO do we even need to update `workspace.files`? maintaining separate editor states is probably sufficient
					workspace.update_file({
						...workspace.selected_file,
						contents: editor_view.state.doc.toString()
					});

					// keep `editor_states` updated so that undo/redo history is preserved for files independently
					editor_states.set(workspace.selected_file.name, editor_view.state);

					await tick();
					skip_reset = false;
				}
			}
		});

		return () => {
			editor_view.destroy();
		};
	});

	beforeNavigate(() => {
		skip_reset = true;
	});

	afterNavigate(async () => {
		skip_reset = false;

		editor_states.clear();
		await reset(workspace.files);

		if (editor_view) {
			// could be false if onMount returned early
			select_state(workspace.selected_name);
		}
	});

	$effect(() => {
		reset(workspace.files);
	});

	$effect(() => {
		select_state(workspace.selected_name);
	});

	$effect(() => {
		if (editor_view) {
			if (workspace.selected_name) {
				const current_warnings = warnings[workspace.selected_name] || [];
				const diagnostics = current_warnings.map((warning) => {
					/** @type {import('@codemirror/lint').Diagnostic} */
					const diagnostic: Diagnostic = {
						from: warning.start!.character,
						to: warning.end!.character,
						severity: 'warning',
						message: warning.message
					};

					return diagnostic;
				});

				const transaction = setDiagnostics(editor_view.state, diagnostics);
				editor_view.dispatch(transaction);
			}
		}
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
	{#if !browser && workspace.selected_file}
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
