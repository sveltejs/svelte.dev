import { compile, compileModule, migrate } from 'svelte/compiler';
import type { File } from '../Workspace.svelte';

// TODO need to handle Svelte 3/4 for playground

addEventListener('message', (event) => {
	const { id, file, options } = event.data as {
		id: number;
		file: File;
		options: { generate: 'client' | 'server'; dev: boolean };
	};

	const fn = file.name.endsWith('.svelte') ? compile : compileModule;

	let migration = null;

	try {
		migration = migrate(file.contents, { filename: file.name });
	} catch (e) {
		// can this happen?
	}

	try {
		const result = fn(file.contents, { ...options, filename: file.name });

		postMessage({
			id,
			payload: {
				error: null,
				result: {
					...result,
					// @ts-expect-error https://github.com/sveltejs/svelte/issues/13628
					warnings: result.warnings.map((w) => ({ message: w.message, ...w }))
				},
				migration
			}
		});
	} catch (e) {
		postMessage({
			id,
			payload: {
				// @ts-expect-error
				error: { message: e.message, ...e },
				result: null,
				migration: null
			}
		});
	}
});
