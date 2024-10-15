<script lang="ts">
	import { get_repl_context } from '../context';
	import { get_full_filename } from '../utils';
	import { tick } from 'svelte';
	import RunesInfo from './RunesInfo.svelte';
	import Migrate from './Migrate.svelte';
	import type { File } from '../types';

	export let show_modified: boolean;
	export let runes: boolean;
	export let remove: (value: { files: File[]; diff: File }) => void;
	export let add: (value: { files: File[]; diff: File }) => void;

	const {
		files,
		handle_select,
		module_editor,
		rebundle,
		selected,
		selected_name,
		EDITOR_STATE_MAP
	} = get_repl_context();

	let editing_name: string | null = null;
	let input_value = '';

	function select_file(filename: string) {
		if ($selected_name !== filename) {
			editing_name = null;
			handle_select(filename);
		}
	}

	function edit_tab(file: File) {
		if ($selected_name === get_full_filename(file)) {
			editing_name = get_full_filename(file);
			input_value = file.name;
		}
	}

	async function close_edit() {
		const match = /(.+)\.(svelte|js|json|md|css)$/.exec(input_value ?? '');

		const edited_file = $files.find((val) => get_full_filename(val) === editing_name);

		if (!edited_file) return;

		edited_file.name = match ? match[1] : input_value;

		if (!$selected) return;

		if (is_file_name_used($selected)) {
			let i = 1;
			let name = $selected.name;

			do {
				const file = $files.find(
					(val) =>
						get_full_filename(val) === get_full_filename(edited_file) &&
						// @ts-ignore
						val.source === $selected.source
				);

				if (!file) break;

				file.name = `${name}_${i++}`;
			} while (is_file_name_used($selected));

			const idx = $files.findIndex(
				(val) => get_full_filename(val) === get_full_filename(edited_file)
			);
			$files[idx] = edited_file;
		}

		const idx = $files.findIndex(
			(val) => get_full_filename(val) === get_full_filename(edited_file)
		);
		if (match?.[2]) $files[idx].type = match[2];

		if (editing_name) {
			const old_state = EDITOR_STATE_MAP.get(editing_name);
			if (old_state) {
				EDITOR_STATE_MAP.set(get_full_filename(edited_file), old_state);
				EDITOR_STATE_MAP.delete(editing_name);
			}
		}

		editing_name = null;

		// re-select, in case the type changed
		handle_select(get_full_filename(edited_file));

		$files = $files;

		// focus the editor, but wait a beat (so key events aren't misdirected)
		await tick();

		$module_editor?.focus();

		rebundle();
	}

	function remove_file(filename: string) {
		const file = $files.find((val) => get_full_filename(val) === filename);
		const idx = $files.findIndex((val) => get_full_filename(val) === filename);

		if (!file) return;

		let result = confirm(`Are you sure you want to delete ${get_full_filename(file)}?`);

		if (!result) return;

		$files = $files.filter((file) => get_full_filename(file) !== filename);

		remove({ files: $files, diff: file });

		EDITOR_STATE_MAP.delete(get_full_filename(file));

		$selected_name = idx === 1 ? 'App.svelte' : get_full_filename(file);
		handle_select($selected_name);
	}

	async function select_input(event: FocusEvent & { currentTarget: HTMLInputElement }) {
		await tick();

		event.currentTarget.select();
	}

	let uid = 1;

	function add_new() {
		const file = {
			name: uid++ ? `Component${uid}` : 'Component1',
			type: 'svelte',
			source: '',
			modified: true
		};

		$files = $files.concat(file);

		editing_name = get_full_filename(file);

		input_value = file.name;

		handle_select(editing_name);

		rebundle();

		add({ files: $files, diff: file });

		$files = $files;
	}

	function is_file_name_used(editing: File) {
		return $files.find(
			(file) => JSON.stringify(file) !== JSON.stringify($selected) && file.name === editing.name
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
			const from_index = $files.findIndex((file) => file.name === from);
			const to_index = $files.findIndex((file) => file.name === over);

			const from_component = $files[from_index];

			$files.splice(from_index, 1);

			$files = $files.slice(0, to_index).concat(from_component).concat($files.slice(to_index));
		}

		from = over = null;
	}
</script>

<div class="component-selector">
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="file-tabs" on:dblclick={add_new}>
		{#each $files as file, index (file.name)}
			{@const filename = get_full_filename(file)}
			<div
				id={file.name}
				class="button"
				role="button"
				tabindex="0"
				class:active={filename === $selected_name}
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
						App.svelte{#if show_modified && file.modified}*{/if}
					</div>
				{:else if filename === editing_name}
					{@const editing_file = $files.find((file) => get_full_filename(file) === editing_name)}

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
						{file.name}.{file.type}{#if show_modified && file.modified}*{/if}
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
