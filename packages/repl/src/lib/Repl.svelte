<script lang="ts">
	import { EditorState } from '@codemirror/state';
	import { SplitPane } from '@rich_harris/svelte-split-pane';
	import { ScreenToggle } from '@sveltejs/site-kit/components';
	import { BROWSER } from 'esm-env';
	import { derived, writable } from 'svelte/store';
	import Bundler from './Bundler.js';
	import ComponentSelector from './Input/ComponentSelector.svelte';
	import Output from './Output/Output.svelte';
	import { set_repl_context } from './context.js';
	import { get_full_filename } from './utils.js';
	import Compiler from './Output/Compiler.js';
	import { Workspace, Editor, type File as WorkspaceFile } from 'editor';
	import type { Bundle, File, ReplContext } from './types.js';
	import type { CompileOptions } from 'svelte/compiler';
	import type { CompilerOutput } from './workers/workers.js';

	export let packagesUrl = 'https://unpkg.com';
	export let svelteUrl = `${BROWSER ? location.origin : ''}/svelte`;
	export let embedded = false;
	export let orientation: 'columns' | 'rows' = 'columns';
	export let relaxed = false;
	export let can_escape = false;
	export let fixed = false;
	export let fixedPos = 50;
	export let injectedJS = '';
	export let injectedCSS = '';
	export let previewTheme: 'light' | 'dark' = 'light';
	export let showModified = false;
	export let showAst = false;
	export let remove: (value: { files: File[]; diff: File }) => void = () => {};
	export let add: (value: { files: File[]; diff: File }) => void = () => {};
	export let change: (value: { files: File[] }) => void = () => {};

	const workspace = new Workspace({
		files: [],
		selected_name: '',
		onupdate(file) {
			rebundle();
		},
		onreset(items) {
			rebundle();
		}
	});

	let editor: any;

	let runes = false;

	export function toJSON() {
		return {
			imports: $bundle?.imports ?? [],
			files: $files
		};
	}

	export async function set(data: { files: File[]; css?: string }) {
		workspace.files = data.files.map((file) => {
			const basename = `${file.name}.${file.type}`;
			return {
				type: 'file',
				name: basename,
				basename,
				contents: file.source,
				text: true
			};
		});

		workspace.selected_name = 'App.svelte';

		editor.reset();
		rebundle();
	}

	export function markSaved() {
		// TODO mark everything in the workspace as unmodified
	}

	const DEFAULT_COMPILE_OPTIONS: CompileOptions = {
		generate: 'client',
		dev: false
	};

	const EDITOR_STATE_MAP: Map<string, EditorState> = new Map();
	const files: ReplContext['files'] = writable([]);
	const selected_name: ReplContext['selected_name'] = writable('App.svelte');
	const selected: ReplContext['selected'] = derived(
		[files, selected_name],
		([$files, $selected_name]) => {
			return (
				$files.find((val) => get_full_filename(val) === $selected_name) ?? {
					name: '',
					type: '',
					source: '',
					modified: false
				}
			);
		}
	);

	const bundle: ReplContext['bundle'] = writable(null);
	const compile_options: ReplContext['compile_options'] = writable(DEFAULT_COMPILE_OPTIONS);
	const cursor_pos: ReplContext['cursor_pos'] = writable(0);
	const module_editor: ReplContext['module_editor'] = writable(null);
	const toggleable: ReplContext['toggleable'] = writable(false);
	const bundler: ReplContext['bundler'] = writable(null);
	const bundling: ReplContext['bundling'] = writable(new Promise(() => {}));

	set_repl_context({
		files,
		selected_name,
		selected,
		bundle,
		bundler,
		bundling,
		compile_options,
		cursor_pos,
		module_editor,
		toggleable,

		EDITOR_STATE_MAP,

		rebundle,
		migrate,
		handle_select
	});

	let current_token: Symbol;

	async function rebundle() {
		const token = (current_token = Symbol());
		let resolver = () => {};
		$bundling = new Promise((resolve) => {
			resolver = resolve;
		});
		const result = await $bundler?.bundle(workspace.files as WorkspaceFile[]);
		if (result && token === current_token) $bundle = result as Bundle;
		resolver();
	}

	async function migrate() {
		if (!compiler || !workspace.selected_name?.endsWith('.svelte')) return;

		const result = await compiler.migrate(workspace.selected_file);
		if (result.error) {
			// TODO show somehow
			return;
		}

		workspace.update_file({
			...workspace.selected_file,
			contents: result.result.code
		});

		rebundle();
	}

	async function handle_select(filename: string) {
		workspace.selected_name = filename;
	}

	const compiler = BROWSER ? new Compiler(svelteUrl) : null;

	let compiled: CompilerOutput | null = null;

	$: mobile = width < 540;

	$: $toggleable = mobile && orientation === 'columns';

	let width = 0;
	let show_output = false;
	let status: string | null = null;
	let status_visible = false;
	let status_timeout: NodeJS.Timeout | undefined = undefined;

	$bundler = BROWSER
		? new Bundler({
				packages_url: packagesUrl,
				svelte_url: svelteUrl,
				onstatus: (message) => {
					if (message) {
						// show bundler status, but only after time has elapsed, to
						// prevent the banner flickering
						if (!status_visible && !status_timeout) {
							status_timeout = setTimeout(() => {
								status_visible = true;
							}, 400);
						}
					} else {
						clearTimeout(status_timeout);
						status_visible = false;
						status_timeout = undefined;
					}

					status = message;
				}
			})
		: null;

	function before_unload(event: BeforeUnloadEvent) {
		// TODO

		if (showModified && $files.find((file) => file.modified)) {
			event.preventDefault();
			event.returnValue = '';
		}
	}
</script>

<svelte:window on:beforeunload={before_unload} />

<div class="container" class:embedded class:toggleable={$toggleable} bind:clientWidth={width}>
	<div class="viewport" class:output={show_output}>
		<SplitPane
			--color="var(--sk-text-4)"
			id="main"
			type={orientation === 'rows' ? 'vertical' : 'horizontal'}
			pos="{mobile || fixed ? fixedPos : orientation === 'rows' ? 60 : 50}%"
			min="100px"
			max="-4.1rem"
		>
			<section slot="a">
				<ComponentSelector show_modified={showModified} {runes} {add} {remove} {workspace} />

				<Editor
					bind:this={editor}
					{workspace}
					onchange={(file, contents) => {
						// TODO is this even necessary? Can it be implicit?
						workspace.update_file({ ...file, contents });
					}}
				/>
			</section>

			<section slot="b" style="height: 100%;">
				<Output
					status={status_visible ? status : null}
					{embedded}
					{relaxed}
					{can_escape}
					{injectedJS}
					{injectedCSS}
					{showAst}
					{previewTheme}
					selected={$selected}
					{compiled}
				/>
			</section>
		</SplitPane>
	</div>

	{#if $toggleable}
		<ScreenToggle bind:checked={show_output} />
	{/if}
</div>

<style>
	.container {
		position: relative;
		flex: 1;
		background: var(--sk-back-1);
		padding: 0;

		&.embedded {
			height: 100%;
		}

		:global {
			section {
				position: relative;
				padding: var(--sk-pane-controls-height) 0 0 0;
				height: 100%;
				box-sizing: border-box;

				& > :first-child {
					position: absolute;
					top: 0;
					left: 0;
					width: 100%;
					height: var(--sk-pane-controls-height);
					box-sizing: border-box;
				}

				& > :last-child {
					width: 100%;
					height: 100%;
				}
			}

			.divider::after {
				background-color: var(--sk-back-5);
			}

			[data-pane='main'] > .divider::after {
				height: calc(100% - var(--sk-pane-controls-height));
				top: var(--sk-pane-controls-height);
			}
		}
	}

	.viewport {
		height: 100%;
	}

	.toggleable .viewport {
		width: 200%;
		height: calc(100% - var(--sk-pane-controls-height));
		transition: transform 0.3s;
	}

	.toggleable .viewport.output {
		transform: translate(-50%);
	}

	/* on mobile, override the <SplitPane> controls */
	@media (max-width: 799px) {
		:global {
			[data-pane='main'] {
				--pos: 50% !important;
			}

			[data-pane='editor'] {
				--pos: 5.4rem !important;
			}

			[data-pane] .divider {
				cursor: default;
			}
		}
	}
</style>
