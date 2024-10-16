import { derived, toStore, writable, type Writable } from 'svelte/store';
import * as adapter from './adapter.svelte';
import type { FileStub, Stub } from '$lib/tutorial';

// TODO convert to state

class Workspace {
	creating = $state.raw<{ parent: string; type: 'file' | 'directory' } | null>(null);

	selected_name = $state<string | null>(null);
}

export const workspace = new Workspace();

export const files = writable([] as Stub[]);

const selected_name = toStore(
	() => workspace.selected_name,
	(v) => (workspace.selected_name = v)
);

export const selected_file = derived([files, selected_name], ([$files, $selected_name]) => {
	return ($files.find((stub) => stub.name === $selected_name) as FileStub) ?? null;
});

export function update_file(file: FileStub) {
	files.update(($files) => {
		return $files.map((old) => {
			if (old.name === file.name) {
				return file;
			}
			return old;
		});
	});

	adapter.update(file);
}

export function reset_files(new_files: Stub[]) {
	// if the selected file no longer exists, clear it
	if (!new_files.find((file) => file.name === workspace.selected_name)) {
		workspace.selected_name = null;
	}

	files.set(new_files);
	adapter.reset(new_files);
}

// this is separate to the workspace
export const solution = writable({} as Record<string, Stub>);
