import { compile, compileModule } from 'svelte/compiler';
import type { File } from '../Workspace.svelte';

addEventListener('message', (event) => {
	const { id, file } = event.data as { id: number; file: File };

	const fn = file.name.endsWith('.svelte') ? compile : compileModule;

	try {
		const result = fn(file.contents, {
			filename: file.name
		});

		postMessage({
			id,
			payload: {
				error: null,
				// @ts-expect-error https://github.com/sveltejs/svelte/issues/13628
				warnings: result.warnings.map((w) => ({ message: w.message, ...w }))
			}
		});
	} catch (e) {
		postMessage({
			id,
			payload: {
				// @ts-expect-error
				error: { message: e.message, ...e },
				warnings: []
			}
		});
	}
});
