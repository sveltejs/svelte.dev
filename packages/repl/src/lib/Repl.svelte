<script lang="ts">
	import { EditorState } from '@codemirror/state';
	import { SplitPane } from '@rich_harris/svelte-split-pane';
	import { BROWSER } from 'esm-env';
	import { createEventDispatcher } from 'svelte';
	import { derived, writable } from 'svelte/store';
	import Bundler from './Bundler.js';
	import ComponentSelector from './Input/ComponentSelector.svelte';
	import ModuleEditor from './Input/ModuleEditor.svelte';
	import InputOutputToggle from './InputOutputToggle.svelte';
	import Output from './Output/Output.svelte';
	import { set_repl_context } from './context.js';
	import { get_full_filename } from './utils.js';
	import Compiler from './Output/Compiler.js';
	import type { Bundle, File, MessageDetails, ReplContext } from './types.js';
	import type { CompileOptions } from 'svelte/compiler';
	import type { CompilerOutput } from './workers/workers.js';

	export let packagesUrl = 'https://unpkg.com';
	export let svelteUrl = `${BROWSER ? location.origin : ''}/svelte`;
	export let embedded = false;
	export let orientation: 'columns' | 'rows' = 'columns';
	export let relaxed = false;
	export let fixed = false;
	export let fixedPos = 50;
	export let injectedJS = '';
	export let injectedCSS = '';
	export let previewTheme: 'light' | 'dark' = 'light';
	export let showModified = false;
	export let showAst = false;
	export let vim: boolean;

	let runes = false;

	export function toJSON() {
		return {
			imports: $bundle?.imports ?? [],
			files: $files
		};
	}

	export async function set(data: { files: File[]; css?: string }) {
		$files = data.files;
		$selected_name = 'App.svelte';

		rebundle();

		// Wait for editors to be ready
		await $module_editor?.isReady;

		await $module_editor?.set({ code: data.files[0].source, lang: data.files[0].type });

		injectedCSS = data.css || '';

		// when we set new files we also populate the EDITOR_STATE_MAP
		// with a new state for each file containing the source as docs
		// this allows the editor to behave correctly when renaming a tab
		// after having loaded the files externally
		populate_editor_state();

		dispatch('change', { files: $files });
	}

	export function markSaved() {
		$files = $files.map((val) => ({ ...val, modified: false }));
	}

	const dispatch: ReturnType<
		typeof createEventDispatcher<{ change: { files: import('./types').File[] } }>
	> = createEventDispatcher();

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
		clear_state,
		go_to_warning_pos,
		handle_change,
		handle_select
	});

	let current_token: Symbol;
	async function rebundle() {
		const token = (current_token = Symbol());
		let resolver = () => {};
		$bundling = new Promise((resolve) => {
			resolver = resolve;
		});
		const result = await $bundler?.bundle($files);
		if (result && token === current_token) $bundle = result as Bundle;
		resolver();
	}

	async function migrate() {
		if (!compiler || $selected?.type !== 'svelte') return;

		const result = await compiler.migrate($selected);
		if (result.error) {
			// TODO show somehow
			return;
		}

		const new_files = $files.map((file) => {
			if (file.name === $selected?.name) {
				return {
					...file,
					source: result.result.code
				};
			}
			return file;
		});
		set({ files: new_files });
	}

	let is_select_changing = false;

	async function handle_select(filename: string) {
		is_select_changing = true;

		$selected_name = filename;

		if (!$selected) return;

		await $module_editor?.set({ code: $selected.source, lang: $selected.type });

		if (EDITOR_STATE_MAP.has(filename)) {
			$module_editor?.setEditorState(EDITOR_STATE_MAP.get(filename));
		} else {
			$module_editor?.clearEditorState();
		}

		is_select_changing = false;
	}

	async function handle_change(event: CustomEvent<{ value: string }>) {
		if (is_select_changing) return;

		files.update(($files) => {
			const file = { ...$selected };

			file.source = event.detail.value;
			file.modified = true;

			const idx = $files.findIndex((val) => get_full_filename(val) === $selected_name);

			// @ts-ignore
			$files[idx] = file;

			return $files;
		});

		if (!$selected) return;

		EDITOR_STATE_MAP.set(get_full_filename($selected), $module_editor?.getEditorState());

		dispatch('change', {
			files: $files
		});

		rebundle();
	}

	async function go_to_warning_pos(item: MessageDetails | undefined) {
		if (!item) return;

		// If its a bundler error, can't do anything about it
		if (!item.filename) return;

		await handle_select(item.filename);

		$module_editor?.focus();
		$module_editor?.setCursor(item.start.character);
	}

	/** Deletes all editor state */
	function clear_state() {
		$module_editor?.clearEditorState();

		EDITOR_STATE_MAP.clear();
	}

	function populate_editor_state() {
		for (const file of $files) {
			EDITOR_STATE_MAP.set(
				get_full_filename(file),
				EditorState.create({
					doc: file.source
				}).toJSON()
			);
		}
	}

	const compiler = BROWSER ? new Compiler(svelteUrl) : null;

	let compiled: CompilerOutput | null = null;

	async function recompile($selected: File | null, $compile_options: CompileOptions) {
		if (!compiler || !$selected) return;

		if ($selected.type === 'svelte' || $selected.type === 'js') {
			compiled = await compiler.compile($selected, $compile_options, true);
			runes = compiled.metadata?.runes ?? false;
		} else {
			runes = false;
		}
	}

	$: recompile($selected, $compile_options);

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
				<ComponentSelector show_modified={showModified} {runes} on:add on:remove />
				<ModuleEditor error={compiled?.error} warnings={compiled?.warnings ?? []} {vim} />
			</section>

			<section slot="b" style="height: 100%;">
				<Output
					status={status_visible ? status : null}
					{embedded}
					{relaxed}
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
		<InputOutputToggle bind:checked={show_output} />
	{/if}
</div>

<style>
	.container {
		--pane-controls-h: 4.2rem;
		position: relative;
		width: 100%;
		height: calc(100dvh - var(--sk-nav-height));
		background: var(--sk-back-1);
		padding: 1rem 0 0 0;

		&.embedded {
			height: 100%;
		}

		:global {
			section {
				position: relative;
				padding: var(--pane-controls-h) 0 0 0;
				height: 100%;
				box-sizing: border-box;

				& > :first-child {
					position: absolute;
					top: 0;
					left: 0;
					width: 100%;
					height: var(--pane-controls-h);
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
				height: calc(100% - var(--pane-controls-h));
				top: var(--pane-controls-h);
			}
		}
	}

	.viewport {
		height: 100%;
	}

	.toggleable .viewport {
		width: 200%;
		height: calc(100% - var(--pane-controls-h));
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
