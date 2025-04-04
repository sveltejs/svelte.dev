import '@sveltejs/site-kit/polyfills';
import type { CompileResult } from 'svelte/compiler';
import type { ExposedCompilerOptions, File } from '../../Workspace.svelte';
import { stripTypes } from 'typestript';
import { load_svelte } from '../npm';

// hack for magic-string and Svelte 4 compiler
// do not put this into a separate module and import it, would be treeshaken in prod
self.window = self;

declare var self: Window & typeof globalThis & { svelte: typeof import('svelte/compiler') };

const cache: Record<string, any> = {};

addEventListener('message', async (event) => {
	const { id, file, version, options } = event.data as {
		id: number;
		file: File;
		version: string;
		options: ExposedCompilerOptions;
	};

	const { can_use_experimental_async, svelte } = (cache[version] ??= await load_svelte(version));

	if (!file.name.endsWith('.svelte') && !file.name.includes('.svelte.') && !svelte.compileModule) {
		// .svelte.js file compiled with Svelte 3/4 compiler
		postMessage({
			id,
			filename: file.name,
			payload: {
				error: null,
				result: null,
				migration: null
			}
		});
		return;
	}

	let migration = null;

	if (file.name.endsWith('.svelte') && svelte.migrate) {
		try {
			migration = svelte.migrate(file.contents, { filename: file.name });
		} catch (e) {
			// can this happen?
		}
	}

	try {
		let result: CompileResult;

		if (file.name.endsWith('.svelte')) {
			const is_svelte_3_or_4 = !svelte.compileModule;
			const compilerOptions: any = {
				generate: is_svelte_3_or_4
					? options.generate === 'client'
						? 'dom'
						: 'ssr'
					: options.generate,
				dev: options.dev,
				filename: file.name
			};

			if (!is_svelte_3_or_4) {
				compilerOptions.modernAst = options.modernAst; // else Svelte 3/4 will throw an "unknown option" error
			}

			if (can_use_experimental_async) {
				compilerOptions.experimental = { async: true };
			}

			result = svelte.compile(file.contents, compilerOptions);
		} else {
			const compilerOptions: any = {
				generate: options.generate,
				dev: options.dev,
				filename: file.name
			};

			if (can_use_experimental_async) {
				compilerOptions.experimental = { async: true };
			}

			const code = file.name.endsWith('.ts') ? stripTypes(file.contents).toString() : file.contents;
			result = svelte.compileModule(code, compilerOptions);
		}

		postMessage({
			id,
			filename: file.name,
			payload: {
				error: null,
				result: {
					metadata: { runes: false },
					...result,
					warnings: result.warnings.map((w) => {
						delete w.toString;
						return { message: w.message, ...w };
					})
				},
				migration
			}
		});
	} catch (e) {
		postMessage({
			id,
			filename: file.name,
			payload: {
				error: { message: e.message, ...e },
				result: null,
				migration: null
			}
		});
	}
});
