<script lang="ts">
	import * as context from './context.js';
	import Item from './Item.svelte';
	import file_icon from 'icons/file';
	import { solution } from '../state.svelte';
	import type { MenuItem } from '$lib/tutorial';
	import type { File } from '@sveltejs/repl/workspace';

	interface Props {
		file: File;
		depth: number;
	}

	let { file, depth }: Props = $props();

	const { rename, remove, select, workspace } = context.get();

	let renaming = $state(false);

	let can_remove = $derived(!$solution[file.name]);

	let actions: MenuItem[] = $derived(
		can_remove
			? [
					{
						icon: 'rename',
						label: 'Rename',
						fn: () => {
							renaming = true;
						}
					},
					{
						icon: 'delete',
						label: 'Delete',
						fn: () => {
							remove(file);
						}
					}
				]
			: []
	);
</script>

<Item
	{depth}
	can_rename={can_remove}
	{renaming}
	basename={file.basename}
	icon={file_icon}
	selected={file.name === workspace.current.name}
	{actions}
	onclick={() => select(file.name)}
	onedit={() => {
		renaming = true;
	}}
	onrename={(basename) => {
		rename(file, basename);
	}}
	oncancel={() => {
		renaming = false;
	}}
/>
