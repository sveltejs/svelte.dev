import type { CompileError, CompileResult } from 'svelte/compiler';
import { EditorState } from '@codemirror/state';
import { compile_file } from './compile-worker';
import { BROWSER } from 'esm-env';
import { basicSetup, EditorView } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { svelte } from '@replit/codemirror-lang-svelte';
import { autocomplete_for_svelte } from '@sveltejs/site-kit/codemirror';
import { keymap } from '@codemirror/view';
import { acceptCompletion } from '@codemirror/autocomplete';
import { indentWithTab } from '@codemirror/commands';
import { indentUnit } from '@codemirror/language';
import { theme } from './theme';

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

function file_type(file: Item) {
	return file.name.split('.').pop();
}

const default_extensions = [
	basicSetup,
	EditorState.tabSize.of(2),
	keymap.of([{ key: 'Tab', run: acceptCompletion }, indentWithTab]),
	indentUnit.of('\t'),
	theme
];

// TODO add vim mode via a compartment (https://codemirror.net/examples/config/)
// let installed_vim = false;
// let should_install_vim = localStorage.getItem('vim') === 'true';

// const q = new URLSearchParams(location.search);
// if (q.has('vim')) {
// 	should_install_vim = q.get('vim') === 'true';
// 	localStorage.setItem('vim', should_install_vim.toString());
// }

// if (!installed_vim && should_install_vim) {
// 	installed_vim = true;
// 	const { vim } = await import('@replit/codemirror-vim');
// 	extensions.push(vim());
// }

export class Workspace {
	// TODO this stuff should all be readonly
	creating = $state.raw<{ parent: string; type: 'file' | 'directory' } | null>(null);
	modified = $state<Record<string, boolean>>({});

	compiler_options = $state.raw<{ generate: 'client' | 'server'; dev: boolean }>({
		generate: 'client',
		dev: false
	});
	compiled = $state<Record<string, Compiled>>({});

	#readonly = false; // TODO do we need workspaces for readonly stuff?
	#files = $state.raw<Item[]>([]);
	#current = $state.raw() as File;

	#onupdate: (file: File) => void;
	#onreset: (items: Item[]) => void;

	// CodeMirror stuff
	states = new Map<string, EditorState>();
	#view: EditorView | null = null;

	constructor(
		files: Item[],
		{
			initial,
			readonly = false,
			onupdate,
			onreset
		}: {
			initial?: string;
			readonly?: boolean;
			onupdate?: (file: File) => void;
			onreset?: (items: Item[]) => void;
		} = {}
	) {
		this.#readonly = readonly;

		this.set(files, initial);

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
		this.#create_directories(item);
		this.#files = this.#files.concat(item);

		if (is_file(item)) {
			this.#select(item);
			this.#onreset?.(this.#files);
		}

		return item;
	}

	focus() {
		setTimeout(() => {
			this.#view?.focus();
		});
	}

	invalidate() {
		this.#reset_diagnostics();
	}

	mark_saved() {
		this.modified = {};
	}

	link(view: EditorView) {
		if (this.#view) throw new Error('view is already linked');
		this.#view = view;

		view.setState(this.#get_state(this.#current));
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

		this.#onreset?.(this.#files);
	}

	rename(previous: Item, name: string) {
		const index = this.files.indexOf(previous);
		const was_current = previous === this.#current;

		const state = this.states.get(previous.name);
		this.states.delete(previous.name);

		const new_item: Item = {
			...previous,
			name,
			basename: name.split('/').pop()!
		};

		this.#create_directories(new_item);

		this.#files = this.#files.map((item, i) => {
			if (i === index) return new_item;

			if (previous.type === 'directory' && item.name.startsWith(previous.name + '/')) {
				return {
					...item,
					name: item.name.replace(previous.name, name)
				};
			}

			return item;
		});

		// preserve state, unless the language changed (in which case
		// it's simpler to just create a new editor state)
		if (state && file_type(previous) === file_type(new_item)) {
			this.states.set(name, state);
		}

		if (was_current) {
			this.#select(new_item as File);
		}

		this.#onreset?.(this.#files);
	}

	reset(new_files: Item[], selected?: string) {
		this.states.clear();
		this.set(new_files, selected);

		this.mark_saved();

		this.#onreset(new_files);
		this.#reset_diagnostics();
	}

	select(name: string) {
		const file = this.#files.find((file) => is_file(file) && file.name === name);

		if (!file) {
			throw new Error(`File ${name} does not exist in workspace`);
		}

		this.#select(file as File);
	}

	set(files: Item[], selected = this.#current?.name) {
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

		for (const [name, state] of this.states) {
			const file = files.find((file) => file.name === name) as File;

			if (file) {
				const existing = state.doc.toString();
				if (file.contents !== existing) {
					const transaction = state.update({
						changes: {
							from: 0,
							to: existing.length,
							insert: file.contents
						}
					});

					this.states.set(file.name, transaction.state);
				}
			} else {
				this.states.delete(name);
			}
		}

		this.#onreset?.(this.files);
	}

	unlink(view: EditorView) {
		if (this.#view !== view) throw new Error('Wrong editor view');
		this.#view = null;
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

	#create_directories(item: Item) {
		// create intermediate directories as necessary
		const parts = item.name.split('/');

		while (parts.length > 1) {
			parts.pop();
			const joined = parts.join('/');

			if (this.files.find((file) => file.name === joined)) {
				return;
			}

			this.#files.push({
				type: 'directory',
				name: joined,
				basename: joined.split('/').pop()! // TODO get rid of this basename nonsense, it's infuriating
			});
		}
	}

	#get_state(file: File) {
		let state = this.states.get(file.name);
		if (state) return state;

		const extensions = [
			...default_extensions,
			EditorState.readOnly.of(this.#readonly),
			EditorView.editable.of(!this.#readonly),
			EditorView.updateListener.of((update) => {
				if (update.docChanged) {
					const state = this.#view!.state!;

					this.update_file({
						...this.#current,
						contents: state.doc.toString()
					});

					// preserve undo/redo across files
					this.states.set(this.#current.name, state);
				}
			})
		];

		switch (file_type(file)) {
			case 'js': // TODO autocomplete, including runes
			case 'json':
				extensions.push(javascript());
				break;

			case 'html':
				extensions.push(html());
				break;

			case 'svelte':
				extensions.push(
					svelte(),
					...autocomplete_for_svelte(
						() => this.current.name,
						() =>
							this.files
								.filter((file) => {
									if (file.type !== 'file') return false;
									// TODO put autocomplete_filter on the workspace
									// return autocomplete_filter(file);
									return true;
								})
								.map((file) => file.name)
					)
				);
				break;
		}

		state = EditorState.create({
			doc: file.contents,
			extensions
		});

		this.states.set(file.name, state);

		return state;
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

	#select(file: File) {
		this.#current = file as File;
		this.#view?.setState(this.#get_state(this.#current));
	}
}
