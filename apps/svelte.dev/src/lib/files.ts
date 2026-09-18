/** Stored files (`App.svelte`) to the `{ name, type }` pairs the playground API speaks. */
export function to_components(files: Array<{ name: string; source: string }>) {
	return files.map((file) => {
		const dot = file.name.lastIndexOf('.');
		if (dot === -1) return { name: file.name, type: '', source: file.source };
		return { name: file.name.slice(0, dot), type: file.name.slice(dot + 1), source: file.source };
	});
}
