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

export class Workspace {
	files = $state.raw<Item[]>([]);
	creating = $state.raw<{ parent: string; type: 'file' | 'directory' } | null>(null);
	selected_name = $state<string | null>(null);

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

		this.#onupdate(file);
	}

	reset_files(new_files: Item[]) {
		// if the selected file no longer exists, clear it
		if (!new_files.find((file) => file.name === this.selected_name)) {
			this.selected_name = null;
		}

		this.files = new_files;

		this.#onreset(new_files);
	}
}
