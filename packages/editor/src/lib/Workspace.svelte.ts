import type { CompileError, Warning } from 'svelte/compiler';
import { get_diagnostics } from './diagnostics';

export interface File {
	type: 'file';
	name: string;
	basename: string;
	contents: string;
	text: boolean;
}

export interface Directory {
	type: 'directory';
	name: string;
	basename: string;
}

export type Item = File | Directory;

export interface Diagnostics {
	error: CompileError | null;
	warnings: Warning[];
}

export class Workspace {
	files = $state.raw<Item[]>([]);
	creating = $state.raw<{ parent: string; type: 'file' | 'directory' } | null>(null);
	selected_name = $state<string | null>(null);

	diagnostics = $state<Record<string, Diagnostics>>({});

	#onupdate: (file: File) => void;
	#onreset: (items: Item[]) => void;

	constructor({
		files,
		selected_name,
		onupdate,
		onreset
	}: {
		files: Item[];
		selected_name: string;
		onupdate: (file: File) => void;
		onreset: (items: Item[]) => void;
	}) {
		this.files = files;
		this.selected_name = selected_name;
		this.#onupdate = onupdate;
		this.#onreset = onreset;

		this.#reset_diagnostics();
	}

	#reset_diagnostics() {
		this.diagnostics = {};

		for (const file of this.files) {
			if (file.type !== 'file') continue;
			if (!/\.svelte(\.|$)/.test(file.name)) continue;

			get_diagnostics(file).then((diagnostics) => {
				this.diagnostics[file.name] = diagnostics;
			});
		}
	}

	get selected_file() {
		for (const file of this.files) {
			if (file.name === this.selected_name) return file as File;
		}

		return null;
	}

	update_file(file: File) {
		this.files = this.files.map((old) => {
			if (old.name === file.name) {
				return file;
			}
			return old;
		});

		get_diagnostics(file).then((diagnostics) => {
			this.diagnostics[file.name] = diagnostics;
		});

		this.#onupdate(file);
	}

	reset_files(new_files: Item[]) {
		// if the selected file no longer exists, clear it
		if (!new_files.find((file) => file.name === this.selected_name)) {
			this.selected_name = null;
		}

		this.files = new_files;

		this.#onreset(new_files);
		this.#reset_diagnostics();
	}
}
