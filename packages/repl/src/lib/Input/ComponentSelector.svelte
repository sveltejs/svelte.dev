<script lang="ts">
	import { get_repl_context } from '../context';
	import { get_full_filename } from '../utils';
	import { tick } from 'svelte';
	import RunesInfo from './RunesInfo.svelte';
	import Migrate from './Migrate.svelte';
	import type { File } from '../types';
	import type { Workspace, File as WorkspaceFile } from 'editor';

	export let runes: boolean;
	export let remove: (value: { files: WorkspaceFile[]; diff: WorkspaceFile }) => void;
	export let add: (value: { files: WorkspaceFile[]; diff: WorkspaceFile }) => void;
	export let workspace: Workspace;

	const { handle_select, module_editor, rebundle } = get_repl_context();

	let editing_name: string | null = null;
	let input_value = '';

	function select_file(filename: string) {
		if (workspace.selected_name !== filename) {
			editing_name = null;
			handle_select(filename);
		}
	}

	function edit_tab(file: File) {
		if (workspace.selected_name === get_full_filename(file)) {
			editing_name = get_full_filename(file);
			input_value = file.name;
		}
	}

	async function close_edit() {
		const match = /(.+)\.(svelte|js|json|md|css)$/.exec(input_value ?? '');

		const edited_file = workspace.files.find((val) => val.name === editing_name);

		if (!edited_file) return;

		edited_file.name = match ? match[1] : input_value;

		if (!workspace.selected_name) return;

		if (is_file_name_used(workspace.selected_name)) {
			let i = 1;
			let name = workspace.selected_name;

			do {
				const file = (workspace.files as WorkspaceFile[]).find(
					(val) =>
						val.name === edited_file.name && val.contents === workspace.selected_file.contents
				);

				if (!file) break;

				file.name = `${name}_${i++}`;
			} while (is_file_name_used(workspace.selected_name));

			const idx = workspace.files.findIndex((val) => val.name === edited_file.name);
			workspace.files[idx] = edited_file;
		}

		const idx = workspace.files.findIndex((val) => val.name === edited_file.name);
		// if (match?.[2]) $files[idx].type = match[2];

		editing_name = null;

		// re-select, in case the type changed
		handle_select(edited_file.name);

		// focus the editor, but wait a beat (so key events aren't misdirected)
		await tick();

		$module_editor?.focus();

		rebundle();
	}

	function remove_file(filename: string) {
		const file = workspace.files.find((val) => val.name === filename);
		const idx = workspace.files.findIndex((val) => val.name === filename);

		if (!file) return;

		let result = confirm(`Are you sure you want to delete ${file.name}?`);

		if (!result) return;

		workspace.files = workspace.files.filter((file) => file.name !== filename);

		remove({ files: workspace.files as WorkspaceFile[], diff: file as WorkspaceFile });

		// TODO is one of these lines redundant?
		workspace.selected_name = idx === 1 ? 'App.svelte' : get_full_filename(file);
		handle_select(workspace.selected_name);
	}

	async function select_input(event: FocusEvent & { currentTarget: HTMLInputElement }) {
		await tick();

		event.currentTarget.select();
	}

	let uid = 1;

	function add_new() {
		const basename = `Component${uid++}`;

		const file: WorkspaceFile = {
			type: 'file',
			name: basename,
			basename,
			contents: '',
			text: true
		};

		workspace.files = workspace.files.concat(file);

		editing_name = file.name;

		input_value = file.name;

		handle_select(editing_name);

		rebundle();

		add({ files: workspace.files as WorkspaceFile[], diff: file });
	}

	function is_file_name_used(editing: WorkspaceFile) {
		return workspace.files.find(
			(file) =>
				JSON.stringify(file) !== JSON.stringify(workspace.selected_file) &&
				file.name === editing.name
		);
	}

	// drag and drop
	let from: string | null = null;
	let over: string | null = null;

	function dragStart(event: DragEvent & { currentTarget: HTMLDivElement }) {
		from = event.currentTarget.id;
	}

	function dragLeave() {
		over = null;
	}

	function dragOver(event: DragEvent & { currentTarget: HTMLDivElement }) {
		over = event.currentTarget.id;
	}

	function dragEnd() {
		if (from && over) {
			const from_index = workspace.files.findIndex((file) => file.name === from);
			const to_index = workspace.files.findIndex((file) => file.name === over);

			const from_component = workspace.files[from_index];

			workspace.files.splice(from_index, 1);

			workspace.files = workspace.files
				.slice(0, to_index)
				.concat(from_component)
				.concat(workspace.files.slice(to_index));
		}

		from = over = null;
	}
</script>

<div class="component-selector">
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="file-tabs" on:dblclick={add_new}>
		{#each workspace.files as file, index (file.name)}
			{@const filename = file.name}
			<div
				id={file.name}
				class="button"
				role="button"
				tabindex="0"
				class:active={filename === workspace.selected_name}
				class:draggable={filename !== editing_name && index !== 0}
				class:drag-over={over === file.name}
				on:click={() => select_file(filename)}
				on:keyup={(e) => e.key === ' ' && select_file(filename)}
				on:dblclick|stopPropagation={() => {}}
				draggable={filename !== editing_name}
				on:dragstart={dragStart}
				on:dragover|preventDefault={dragOver}
				on:dragleave={dragLeave}
				on:drop|preventDefault={dragEnd}
			>
				<i class="drag-handle"></i>

				{#if file.name === 'App' && filename !== editing_name}
					<div class="uneditable">
						App.svelte{#if workspace.modified[file.name]}*{/if}
					</div>
				{:else if filename === editing_name}
					{@const editing_file = workspace.files.find((file) => file.name === editing_name)}

					{#if editing_file}
						<span class="input-sizer">
							<span style="color: transparent">{input_value}</span>
							{#if !/\./.test(input_value)}.{editing_file.type}{/if}
							<!-- {input_value + (/\./.test(input_value) ? '' : `.${editing_file.type}`)} -->
						</span>

						<!-- svelte-ignore a11y_autofocus -->
						<input
							autofocus
							spellcheck={false}
							bind:value={input_value}
							on:focus={select_input}
							on:blur={close_edit}
							on:keydown={(e) => {
								if (e.key === 'Enter') {
									e.preventDefault();
									if (!is_file_name_used(editing_file)) {
										e.currentTarget.blur();
									}
								}
							}}
							class:duplicate={is_file_name_used(editing_file)}
						/>
					{/if}
				{:else}
					<div
						class="editable"
						title="edit component name"
						on:click={() => edit_tab(file)}
						on:keyup={(e) => e.key === ' ' && edit_tab(file)}
					>
						{file.name}{#if workspace.modified[file.name]}*{/if}
					</div>

					<span
						class="remove"
						on:click={() => remove_file(filename)}
						on:keyup={(e) => e.key === ' ' && remove_file(filename)}
					>
						<svg width="12" height="12" viewBox="0 0 24 24">
							<line stroke="#999" x1="18" y1="6" x2="6" y2="18" />
							<line stroke="#999" x1="6" y1="6" x2="18" y2="18" />
						</svg>
					</span>
				{/if}
			</div>
		{/each}
	</div>

	<button
		class="add-new"
		on:click={add_new}
		aria-label="add new component"
		title="add new component"
	></button>

	<div class="runes">
		<RunesInfo {runes} />
		<Migrate />
	</div>

	<!-- <div class="migrate-info"></div> -->
</div>

<style>
	.component-selector {
		position: relative;
		display: flex;
		padding: 0 1rem 0 0;

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

	.file-tabs {
		border: none;
		margin: 0;
		white-space: nowrap;
		overflow-x: auto;
		overflow-y: hidden;
	}

	.file-tabs .button,
	.add-new {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font: var(--sk-font-ui-small);
		border: none;
		padding: 0 1rem;
		height: 100%;
		aspect-ratio: 1;
		margin: 0;
		color: var(--sk-text-3);
		border-radius: 0;
		cursor: pointer;
	}

	.add-new {
		background: url(./file-new.svg) 50% 50% no-repeat;
		background-size: 1em;
	}

	.file-tabs .button {
		padding: 0 1rem 0 2em;

		.drag-handle {
			cursor: move;
			width: 2em;
			height: 100%;
			position: absolute;
			left: 0em;
			top: 0;
			background: url(./file.svg) 50% 50% no-repeat;
			background-size: 1em;
		}

		&.active {
			color: var(--sk-text-2, #333);
			border-bottom: 1px solid var(--sk-theme-1);
		}
	}

	.editable,
	.uneditable,
	.input-sizer,
	input {
		display: inline-block;
		position: relative;
		line-height: 1;
	}

	.input-sizer {
		display: flex;
		color: var(--sk-text-3, #ccc);
	}

	input {
		position: absolute;
		width: 100%;
		border: none;
		color: var(--sk-theme-1);
		outline: none;
		background-color: transparent;
		top: 0;
		left: 0;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: var(--sk-font-family-ui);
		font: var(--sk-font-ui-small); /* TODO can we just inherit */
		padding: 0 1rem 1px 2em;
		box-sizing: border-box;
	}

	.duplicate {
		color: var(--sk-theme-1);
	}

	.remove {
		position: absolute;
		display: none;
		right: 1px;
		top: 4px;
		width: 16px;
		text-align: right;
		padding: 12px 0 12px 5px;
		font-size: 8px;
		cursor: pointer;
	}

	.file-tabs .button.active .editable {
		cursor: text;
	}

	.file-tabs .button.active .remove {
		display: block;
	}

	.file-tabs .button.drag-over {
		background: #67677814;
	}

	.file-tabs .button.drag-over {
		cursor: move;
	}

	.add-new {
		padding: 12px 10px 8px 8px;
		height: 40px;
		text-align: center;
	}

	.runes {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: flex-end;
	}

	svg {
		position: relative;
		overflow: hidden;
		vertical-align: middle;
		-o-object-fit: contain;
		object-fit: contain;
		-webkit-transform-origin: center center;
		transform-origin: center center;

		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
		fill: none;
	}
</style>
