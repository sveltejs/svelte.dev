import '@sveltejs/site-kit/polyfills';
import { parseTar } from 'tarparser';
import type { CompileResult } from 'svelte/compiler';
import type { ExposedCompilerOptions, File } from '../Workspace.svelte';
import type { FileDescription } from 'tarparser';

// hack for magic-string and Svelte 4 compiler
// do not put this into a separate module and import it, would be treeshaken in prod
self.window = self;

declare var self: Window & typeof globalThis & { svelte: typeof import('svelte/compiler') };

let inited: PromiseWithResolvers<typeof self.svelte>;

let can_use_experimental_async = false;

async function init(v: string) {
	const svelte_url = v === 'local' ? '/svelte' : `https://unpkg.com/svelte@${v}`;
	const match = /^(?:pr|commit|branch)-(.+)/.exec(v);

	let tarball: FileDescription[] | undefined;
	let version: string;

	if (match) {
		const response = await fetch(`https://pkg.pr.new/svelte@${match[1]}`);

		if (!response.ok) {
			throw new Error('Could not fetch tarball');
		}

		tarball = await parseTar(await response.arrayBuffer());

		const json = tarball.find((file) => file.name === 'package/package.json')!.text;
		version = JSON.parse(json).version;
	} else {
		version = (await fetch(`${svelte_url}/package.json`).then((r) => r.json())).version;
	}

	const entry = version.startsWith('3.')
		? 'compiler.js'
		: version.startsWith('4.')
			? 'compiler.cjs'
			: 'compiler/index.js';

	const compiler = tarball
		? tarball.find((file) => file.name === `package/${entry}`)!.text
		: await fetch(`${svelte_url}/${entry}`).then((r) => r.text());

	(0, eval)(compiler + `\n//# sourceURL=${entry}@` + version);

	try {
		self.svelte.compileModule('', {
			generate: 'client',
			// @ts-expect-error
			experimental: {
				async: true
			}
		});

		can_use_experimental_async = true;
	} catch (e) {
		console.error(e);
		// do nothing
	}

	return self.svelte;
}

addEventListener('message', async (event) => {
	if (!inited) {
		inited = Promise.withResolvers();
		init(event.data.version).then(inited.resolve, inited.reject);
	}

	const svelte = await inited.promise;

	const { id, file, options } = event.data as {
		id: number;
		file: File;
		options: ExposedCompilerOptions;
	};

	if (!file.name.endsWith('.svelte') && !svelte.compileModule) {
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

	if (svelte.migrate) {
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

			result = svelte.compileModule(file.contents, compilerOptions);
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
