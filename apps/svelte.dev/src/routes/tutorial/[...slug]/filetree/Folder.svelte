<script lang="ts">
	import Folder from './Folder.svelte';
	import File from './File.svelte';
	import * as context from './context.js';
	import { get_depth } from '$lib/utils/path.js';
	import Item from './Item.svelte';
	import folder_closed from 'icons/folder';
	import folder_open from 'icons/folder-open';
	import { solution } from '../state.svelte';
	import type { MenuItem } from '$lib/tutorial';
	import type { Directory, File as IFile, Item as IItem } from '@sveltejs/repl/workspace';

	interface Props {
		directory: Directory;
		prefix: string;
		depth: number;
		contents: IItem[];
	}

	let { directory, prefix, depth, contents }: Props = $props();

	let renaming = $state(false);

	const { collapsed, rename, add, remove, workspace } = context.get();

	let segments = $derived(get_depth(prefix));

	let children = $derived(
		contents
			.filter((file) => file.name.startsWith(prefix))
			.sort((a, b) => (a.name < b.name ? -1 : 1))
	);

	let child_directories = $derived(
		children.filter((child) => get_depth(child.name) === segments && child.type === 'directory')
	);

	let child_files = $derived(
		children.filter((child) => get_depth(child.name) === segments && child.type === 'file')
	) as IFile[];

	const can_create = $derived.by(() => {
		const result = {
			file: false,
			directory: false
		};

		const child_prefixes = [];

		for (const file of workspace.files) {
			if (
				file.type === 'directory' &&
				file.name.startsWith(prefix) &&
				get_depth(file.name) === depth + 1
			) {
				child_prefixes.push(file.name + '/');
			}
		}

		for (const file of Object.values($solution)) {
			if (!file.name.startsWith(prefix)) continue;

			// if already exists in workspace.files, bail
			if (workspace.files.find((f) => f.name === file.name)) continue;

			// if intermediate directory exists, bail
			if (child_prefixes.some((prefix) => file.name.startsWith(prefix))) continue;

			result[file.type] = true;
		}

		return result;
	});

	// fake root directory has no name
	let can_remove = $derived(directory.name ? !$solution[directory.name] : false);

	let actions = $derived(
		[
			can_create.file && {
				icon: 'file-new',
				label: 'New file',
				fn: () => {
					workspace.creating = {
						parent: directory.name,
						type: 'file'
					};
				}
			},
			can_create.directory && {
				icon: 'folder-new',
				label: 'New folder',
				fn: () => {
					workspace.creating = {
						parent: directory.name,
						type: 'directory'
					};
				}
			},
			can_remove && {
				icon: 'rename',
				label: 'Rename',
				fn: () => {
					renaming = true;
				}
			},
			can_remove && {
				icon: 'delete',
				label: 'Delete',
				fn: () => {
					remove(directory);
				}
			}
		].filter(Boolean)
	) as MenuItem[];
</script>

<Item
	{depth}
	basename={directory.basename}
	icon={$collapsed[directory.name] ? folder_closed : folder_open}
	can_rename={can_remove}
	{renaming}
	{actions}
	onclick={() => {
		$collapsed[directory.name] = !$collapsed[directory.name];
	}}
	onedit={() => {
		renaming = true;
	}}
	onrename={(basename) => {
		rename(directory, basename);
	}}
	oncancel={() => {
		renaming = false;
	}}
	onkeydown={(e) => {
		if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
			$collapsed[directory.name] = e.key === 'ArrowLeft';
		}
	}}
/>

{#if !$collapsed[directory.name]}
	{#if workspace.creating?.parent === directory.name && workspace.creating.type === 'directory'}
		<Item
			depth={depth + 1}
			renaming
			onrename={(basename) => {
				add(prefix + basename, 'directory');
			}}
			oncancel={() => {
				workspace.creating = null;
			}}
		/>
	{/if}

	{#each child_directories as directory}
		<Folder
			directory={directory as Directory}
			prefix={directory.name + '/'}
			depth={depth + 1}
			contents={children}
		/>
	{/each}

	{#if workspace.creating?.parent === directory.name && workspace.creating.type === 'file'}
		<Item
			depth={depth + 1}
			renaming
			onrename={(basename) => {
				add(prefix + basename, 'file');
			}}
			oncancel={() => {
				workspace.creating = null;
			}}
		/>
	{/if}

	{#each child_files as file, i}
		<File {file} depth={depth + 1} />
	{/each}
{/if}
