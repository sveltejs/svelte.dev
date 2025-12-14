<script lang="ts">
	import { writable } from 'svelte/store';
	import Folder from './Folder.svelte';
	import * as context from './context.js';
	import Modal from '$lib/components/Modal.svelte';
	import { solution } from '../state.svelte';
	import { afterNavigate } from '$app/navigation';
	import type { Exercise } from '$lib/tutorial';
	import type { Workspace, Item } from '@sveltejs/repl/workspace';

	interface Props {
		exercise: Exercise;
		mobile?: boolean;
		workspace: Workspace;
	}

	let { exercise, mobile = false, workspace }: Props = $props();

	const hidden = new Set(['__client.js', 'node_modules', '__delete']);

	let modal_text = $state('');

	const collapsed = writable({} as Record<string, boolean>);

	afterNavigate(() => {
		collapsed.set({});
	});

	context.set({
		collapsed,

		add: async (name, type) => {
			const expected = $solution[name];

			if (expected && type !== expected.type) {
				modal_text = `${name.slice(exercise.scope.prefix.length)} should be a ${expected.type}, not a ${type}!`;
				return;
			}

			if (!expected && !exercise.editing_constraints.create.has(name)) {
				modal_text =
					'Only the following files and folders are allowed to be created in this exercise:\n' +
					Array.from(exercise.editing_constraints.create).join('\n');
				return;
			}

			const existing = workspace.files.find((file) => file.name === name);
			if (existing) {
				modal_text = `A ${existing.type} already exists with this name`;
				return;
			}

			const basename = name.split('/').pop()!;

			const file: Item =
				type === 'file'
					? { type, name, basename, text: true, contents: '' }
					: { type, name, basename };

			workspace.add(file);
		},

		rename: async (to_rename, new_name) => {
			const new_full_name = to_rename.name.slice(0, -to_rename.basename.length) + new_name;

			if (workspace.files.some((f) => f.name === new_full_name)) {
				modal_text = `A file or folder named ${new_full_name} already exists`;
				return;
			}

			if (!$solution[new_full_name] && !exercise.editing_constraints.create.has(new_full_name)) {
				modal_text =
					'Only the following files and folders are allowed to be created in this exercise:\n' +
					Array.from(exercise.editing_constraints.create).join('\n');
				return;
			}

			if ($solution[to_rename.name] && !exercise.editing_constraints.remove.has(to_rename.name)) {
				modal_text =
					'Only the following files and folders are allowed to be removed in this exercise:\n' +
					Array.from(exercise.editing_constraints.remove).join('\n');
				return;
			}

			workspace.rename(to_rename, new_full_name);
			workspace.focus();
		},

		remove: async (file) => {
			if ($solution[file.name] && !exercise.editing_constraints.remove.has(file.name)) {
				modal_text =
					'Only the following files and folders are allowed to be deleted in this tutorial chapter:\n' +
					Array.from(exercise.editing_constraints.remove).join('\n');
				return;
			}

			workspace.remove(file);
		},

		select: (name) => {
			workspace.select(name);
		},

		// svelte-ignore state_referenced_locally
		workspace
	});

	function is_deleted(file: Item) {
		if (file.type === 'directory') return `${file.name}/__delete` in exercise.a;
		if (file.text) return file.contents.startsWith('__delete');

		return false;
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<ul
	class="filetree"
	class:mobile
	onkeydown={(e) => {
		if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
			e.preventDefault();
			const lis = Array.from(e.currentTarget.querySelectorAll('li'));
			const focused = lis.findIndex((li) => li.contains(e.target as HTMLElement));

			const d = e.key === 'ArrowUp' ? -1 : +1;

			lis[focused + d]?.querySelector('button')?.focus();
		}
	}}
>
	<Folder
		prefix={exercise.scope.prefix}
		depth={0}
		directory={{
			type: 'directory',
			name: '',
			basename: exercise.scope.name
		}}
		contents={workspace.files.filter((file) => !hidden.has(file.basename) && !is_deleted(file))}
	/>
</ul>

{#if modal_text}
	<Modal on:close={() => (modal_text = '')}>
		<div class="modal-contents">
			<h2>This action is not allowed</h2>
			<p>{modal_text}</p>
			<button class="raised primary" onclick={() => (modal_text = '')}>OK</button>
		</div>
	</Modal>
{/if}

<style>
	.filetree {
		font: var(--sk-font-ui-small);
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		padding: 1rem 0rem;
		margin: 0;
		background: var(--sk-bg-3);
		list-style: none;
	}

	.filetree.mobile {
		height: 100%;
	}

	.modal-contents p {
		white-space: pre-line;
	}
</style>
