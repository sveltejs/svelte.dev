import { derived, writable, type Writable } from 'svelte/store';
import * as adapter from './adapter.svelte';
import type { FileStub, Stub } from '$lib/tutorial';

// TODO convert to state

export const files = writable([] as Stub[]);

export const solution = writable({} as Record<string, Stub>);

export const creating: Writable<{ parent: string; type: 'file' | 'directory' } | null> =
	writable(null);

export const selected_name: Writable<string | null> = writable(null);

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
	selected_name.update(($selected_name) => {
		const file = new_files.find((file) => file.name === $selected_name);
		return file?.name ?? null;
	});

	files.set(new_files);
	adapter.reset(new_files);
}
