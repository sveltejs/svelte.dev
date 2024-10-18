import type { CompileError, CompileResult } from 'svelte/compiler';
import { compile_file } from './compile-worker';
import { BROWSER } from 'esm-env';
import { untrack } from 'svelte';

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

function is_file(item: Item): item is File {
	return item.type === 'file';
}

function is_svelte_file(file: File) {
	return /\.svelte(\.|$)/.test(file.name);
}

export class Workspace {
	// TODO this stuff should all be readonly
	creating = $state.raw<{ parent: string; type: 'file' | 'directory' } | null>(null);
	modified = $state<Record<string, boolean>>({});

	compiler_options = $state.raw<{ generate: 'client' | 'server'; dev: boolean }>({
		generate: 'client',
		dev: false
	});
	compiled = $state<Record<string, Compiled>>({});

	#files = $state.raw<Item[]>([]);
	#current = $state.raw() as File;

	#onupdate: (file: File) => void;
	#onreset: (items: Item[]) => void;

	constructor(
		files: Item[],
		{
			initial,
			onupdate,
			onreset
		}: {
			initial?: string;
			onupdate?: (file: File) => void;
			onreset?: (items: Item[]) => void;
		} = {}
	) {
		this.#set_files(files, initial);

		this.#onupdate = onupdate ?? (() => {});
		this.#onreset = onreset ?? (() => {});

		this.#reset_diagnostics();
	}

	get files() {
		return this.#files;
	}

	get current() {
		return this.#current;
	}

	add(item: Item) {
		this.#files = this.#files.concat(item);
		if (is_file(item)) this.#current = item;
		return item;
	}

	invalidate() {
		this.#reset_diagnostics();
	}

	mark_saved() {
		this.modified = {};
	}

	move(from: Item, to: Item) {
		const from_index = this.#files.indexOf(from);
		const to_index = this.#files.indexOf(to);

		this.#files.splice(from_index, 1);

		this.#files = this.#files.slice(0, to_index).concat(from).concat(this.#files.slice(to_index));
	}

	remove(item: Item) {
		const index = this.#files.indexOf(item);

		if (index === -1) {
			throw new Error('Tried to remove a file that does not exist in the workspace');
		}

		let next = this.#current;

		if (next === item) {
			const file =
				this.#files.slice(0, index).findLast(is_file) ?? this.#files.slice(index + 1).find(is_file);

			if (!file) {
				throw new Error('Cannot delete the only file');
			}

			next = file;
		}

		this.#files = this.#files.filter((f) => {
			if (f === item) return false;
			if (f.name.startsWith(item.name + '/')) return false;
			return true;
		});

		this.#current = next;
	}

	reset_files(new_files: Item[], selected?: string) {
		// untrack in case this is called in an effect
		// TODO if ($effect.tracking()) throw new Error('...');

		untrack(() => {
			this.#set_files(new_files, selected);

			this.mark_saved();

			this.#onreset(new_files);
			this.#reset_diagnostics();
		});
	}

	select(name: string) {
		// untrack in case this is called in an effect
		// TODO if ($effect.tracking()) throw new Error('...');

		untrack(() => {
			const file = this.#files.find((file) => is_file(file) && file.name === name);

			if (!file) {
				throw new Error(`File ${name} does not exist in workspace`);
			}

			this.#current = file as File;
		});
	}

	update_file(file: File) {
		this.#files = this.#files.map((old) => {
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

	#reset_diagnostics() {
		if (!BROWSER) return;

		const keys = Object.keys(this.compiled);
		const seen: string[] = [];

		let files = this.#files;

		// prioritise selected file
		if (this.current) {
			const i = this.#files.indexOf(this.current!);
			files = [this.current, ...this.#files.slice(0, i), ...this.#files.slice(i + 1)];
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

	#set_files(files: Item[], selected = this.#current?.name) {
		const first = files.find(is_file);

		if (!first) {
			throw new Error('Workspace must have at least one file');
		}

		if (selected) {
			const file = files.find((file) => is_file(file) && file.name === selected);

			if (!file) {
				throw new Error(`Invalid selection ${selected}`);
			}

			this.#current = file as File;
		} else {
			this.#current = first;
		}

		this.#files = files;
	}
}
