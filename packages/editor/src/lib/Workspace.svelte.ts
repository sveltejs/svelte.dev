import type { CompileError, CompileResult } from 'svelte/compiler';
import { compile_file } from './compile-worker';
import { BROWSER } from 'esm-env';

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

export interface Compiled {
	error: CompileError | null;
	result: CompileResult;
	migration: {
		code: string;
	};
}

function is_svelte_file(file: File) {
	return /\.svelte(\.|$)/.test(file.name);
}

export class Workspace {
	files = $state.raw<Item[]>([]);
	creating = $state.raw<{ parent: string; type: 'file' | 'directory' } | null>(null);
	selected_name = $state<string | null>(null);

	modified = $state<Record<string, boolean>>({});

	compiler_options = $state.raw<{ generate: 'client' | 'server'; dev: boolean }>({
		generate: 'client',
		dev: false
	});
	compiled = $state<Record<string, Compiled>>({});

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
		onupdate?: (file: File) => void;
		onreset?: (items: Item[]) => void;
	}) {
		this.files = files;
		this.selected_name = selected_name;
		this.#onupdate = onupdate ?? (() => {});
		this.#onreset = onreset ?? (() => {});

		this.#reset_diagnostics();
	}

	#reset_diagnostics() {
		if (!BROWSER) return;

		const keys = Object.keys(this.compiled);
		const seen: string[] = [];

		let files = this.files;

		// prioritise selected file
		if (this.selected_file) {
			const i = this.files.indexOf(this.selected_file!);
			files = [this.selected_file, ...this.files.slice(0, i), ...this.files.slice(i + 1)];
		}

		for (const file of files) {
			if (file.type !== 'file') continue;
			if (!is_svelte_file(file)) continue;

			seen.push(file.name);

			compile_file(file, this.compiler_options).then((compiled) => {
				this.compiled[file.name] = compiled;
			});
		}

		for (const key of keys) {
			if (!seen.includes(key)) {
				delete this.compiled[key];
			}
		}
	}

	get selected_file() {
		for (const file of this.files) {
			if (file.name === this.selected_name) return file as File;
		}

		return null;
	}

	invalidate() {
		this.#reset_diagnostics();
	}

	mark_saved() {
		this.modified = {};
	}

	update_file(file: File) {
		this.files = this.files.map((old) => {
			if (old.name === file.name) {
				return file;
			}
			return old;
		});

		this.modified[file.name] = true;

		if (BROWSER && is_svelte_file(file)) {
			compile_file(file, this.compiler_options).then((compiled) => {
				this.compiled[file.name] = compiled;
			});
		}

		this.#onupdate(file);
	}

	reset_files(new_files: Item[]) {
		// if the selected file no longer exists, clear it
		if (!new_files.find((file) => file.name === this.selected_name)) {
			this.selected_name = null;
		}

		this.files = new_files;

		this.mark_saved();

		this.#onreset(new_files);
		this.#reset_diagnostics();
	}
}
