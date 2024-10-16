import type { Directory, Item } from 'editor';

export function create_directories(name: string, files: Item[]) {
	const existing = new Set();

	for (const file of files) {
		if (file.type === 'directory') {
			existing.add(file.name);
		}
	}

	const directories: Directory[] = [];

	const parts = name.split('/');
	while (parts.length) {
		parts.pop();

		const dir = parts.join('/');
		if (existing.has(dir)) {
			break;
		}

		directories.push({
			type: 'directory',
			name: dir,
			basename: parts.at(-1)!
		});
	}

	return directories;
}
