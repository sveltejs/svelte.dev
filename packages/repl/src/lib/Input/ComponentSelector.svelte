<script lang="ts">
	import RunesInfo from './RunesInfo.svelte';
	import Migrate from './Migrate.svelte';
	import type { Workspace, File } from 'editor';

	interface Props {
		runes: boolean;
		onchange: () => void;
		workspace: Workspace;
		can_migrate: boolean;
	}

	let { runes, onchange, workspace, can_migrate }: Props = $props();

	let input_value = $state(workspace.current.name);

	async function close_edit(file: File) {
		if (input_value === file.name) {
			// nothing to do
			return;
		}

		const deconflicted = deconflict(input_value, file);

		workspace.rename(file, deconflicted);
		workspace.focus();
	}

	function deconflict(name: string, file?: File) {
		let deconflicted = name;
		let i = 1;

		while (true) {
			const existing = workspace.files.find((file) => file.name === deconflicted);
			if (!existing || existing === file) return deconflicted;

			deconflicted = name.replace(/(\.|$)/, `${i++}$1`);
		}
	}

	function remove_file(file: File) {
		let result = confirm(`Are you sure you want to delete ${file.name}?`);
		if (!result) return;

		workspace.remove(file);

		onchange();
	}

	function add_new() {
		const basename = deconflict(`Component.svelte`);

		const file = workspace.add({
			type: 'file',
			name: basename,
			basename,
			contents: '',
			text: true
		});

		input_value = file.name;
		onchange();
	}

	// drag and drop
	let dragging: File | null = null;
	let dragover: File | null = $state.raw(null);
</script>

<div class="component-selector">
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="file-tabs">
		{#each workspace.files as File[] as file, index (file.name)}
			<div
				class="button"
				role="button"
				tabindex="0"
				class:active={file === workspace.current}
				class:draggable={file !== workspace.current && index !== 0}
				class:drag-over={file === dragover}
				onclick={() => {
					workspace.select(file.name);
					input_value = file.name;
				}}
				onkeyup={(e) => e.key === ' ' && workspace.select(file.name)}
				draggable={file !== workspace.current}
				ondragstart={() => (dragging = file)}
				ondragover={(e) => (e.preventDefault(), (dragover = file))}
				ondragleave={(e) => (e.preventDefault(), (dragover = null))}
				ondrop={() => {
					if (dragging && dragover) {
						workspace.move(dragging, dragover);
					}

					dragging = dragover = null;
				}}
			>
				<i class="drag-handle"></i>

				<span class:editable={file.name !== 'App.svelte'}>
					{(file === workspace.current && file.name !== 'App.svelte' ? input_value : file.name) +
						(workspace.modified[file.name] ? '*' : '')}
				</span>

				{#if file === workspace.current && file.name !== 'App.svelte'}
					<!-- svelte-ignore a11y_autofocus -->
					<input
						spellcheck={false}
						bind:value={input_value}
						onfocus={async (event) => {
							const input = event.currentTarget;
							setTimeout(() => {
								input.select();
							});
						}}
						onblur={() => close_edit(file)}
						onkeydown={(e) => {
							if (e.key === 'Enter') {
								e.preventDefault();
								e.currentTarget.blur();
							}

							if (e.key === 'Escape') {
								input_value = file.name;
								e.currentTarget.blur();
							}
						}}
					/>

					<span
						class="remove"
						onclick={(e) => {
							// TODO make this a real button, get rid of the keyup listener
							remove_file(file);
							e.stopPropagation();
						}}
						onkeyup={(e) => e.key === ' ' && remove_file(file)}
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

	<button class="add-new" onclick={add_new} aria-label="add new component" title="add new component"
	></button>

	<div class="runes">
		<RunesInfo {runes} />
		<Migrate {can_migrate} />
	</div>
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
			background-color: var(--sk-border);
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
			border-bottom: 1px solid var(--sk-fg-accent);
		}
	}

	input {
		position: absolute;
		width: 100%;
		border: none;
		outline: none;
		background-color: inherit;
		color: inherit;
		top: 0;
		left: 0;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: var(--sk-font-family-ui);
		font: var(--sk-font-ui-small); /* TODO can we just inherit */
		padding: 0 1rem 0 2em;
		box-sizing: border-box;

		&:focus {
			color: var(--sk-fg-accent);
		}
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
