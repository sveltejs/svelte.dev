import type { CompileResult } from 'svelte/compiler';
import type { ExposedCompilerOptions, File } from '../Workspace.svelte';

// hack for magic-string and Svelte 4 compiler
// do not put this into a separate module and import it, would be treeshaken in prod
self.window = self;

declare var self: Window & typeof globalThis & { svelte: typeof import('svelte/compiler') };

let inited = false;
let fulfil_ready: (arg?: never) => void;
const ready = new Promise((f) => {
	fulfil_ready = f;
});

addEventListener('message', async (event) => {
	if (!inited) {
		inited = true;
		const svelte_url = `https://unpkg.com/svelte@${event.data.version}`;
		const { version } = await fetch(`${svelte_url}/package.json`).then((r) => r.json());

		if (version.startsWith('4.')) {
			// unpkg doesn't set the correct MIME type for .cjs files
			// https://github.com/mjackson/unpkg/issues/355
			const compiler = await fetch(`${svelte_url}/compiler.cjs`).then((r) => r.text());
			(0, eval)(compiler + '\n//# sourceURL=compiler.cjs@' + version);
		} else if (version.startsWith('3.')) {
			const compiler = await fetch(`${svelte_url}/compiler.js`).then((r) => r.text());
			(0, eval)(compiler + '\n//# sourceURL=compiler.js@' + version);
		} else {
			const compiler = await fetch(`${svelte_url}/compiler/index.js`).then((r) => r.text());
			(0, eval)(compiler + '\n//# sourceURL=compiler/index.js@' + version);
		}

		fulfil_ready();
	}

	await ready;

	const { id, file, options } = event.data as {
		id: number;
		file: File;
		options: ExposedCompilerOptions;
	};

	if (!file.name.endsWith('.svelte') && !self.svelte.compileModule) {
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

	if (self.svelte.migrate) {
		try {
			migration = self.svelte.migrate(file.contents, { filename: file.name });
		} catch (e) {
			// can this happen?
		}
	}

	try {
		let result: CompileResult;

		if (file.name.endsWith('.svelte')) {
			result = self.svelte.compile(file.contents, {
				generate: options.generate, // TODO do we need to adjust this for 3/4?
				dev: options.dev,
				modernAst: options.modernAst,
				filename: file.name
			});
		} else {
			result = self.svelte.compileModule(file.contents, {
				generate: options.generate,
				dev: options.dev,
				filename: file.name
			});
		}

		postMessage({
			id,
			filename: file.name,
			payload: {
				error: null,
				result: {
					// @ts-expect-error Svelte 3/4 doesn't contain this field
					metadata: { runes: false },
					...result,
					warnings: result.warnings.map((w) => {
						// @ts-expect-error This exists on Svelte 3/4 and is required to be deleted, otherwise postMessage won't work
						delete w.toString;
						// @ts-expect-error https://github.com/sveltejs/svelte/issues/13628 (fixed in 5.0, but was like that for most of the preview phase)
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
				// @ts-expect-error
				error: { message: e.message, ...e },
				result: null,
				migration: null
			}
		});
	}
});
