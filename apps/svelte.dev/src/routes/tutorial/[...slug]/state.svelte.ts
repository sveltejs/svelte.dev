import { writable } from 'svelte/store';
import * as adapter from './adapter.svelte';
import type { FileStub, Stub } from '$lib/tutorial';

export class Workspace {
	files = $state.raw<Stub[]>([]);
	creating = $state.raw<{ parent: string; type: 'file' | 'directory' } | null>(null);
	selected_name = $state<string | null>(null);

	get selected_file() {
		for (const file of this.files) {
			if (file.name === this.selected_name) return file as FileStub;
		}

		return null;
	}

	update_file(file: FileStub) {
		this.files = this.files.map((old) => {
			if (old.name === file.name) {
				return file;
			}
			return old;
		});

		// TODO decouple
		adapter.update(file);
	}

	reset_files(new_files: Stub[]) {
		// if the selected file no longer exists, clear it
		if (!new_files.find((file) => file.name === this.selected_name)) {
			this.selected_name = null;
		}

		this.files = new_files;

		// TODO decouple
		adapter.reset(new_files);
	}
}

// this is separate to the workspace
export const solution = writable({} as Record<string, Stub>);
