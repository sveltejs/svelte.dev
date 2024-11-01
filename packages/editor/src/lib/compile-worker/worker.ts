import type { File } from '../Workspace.svelte';
import { parseTar } from 'tarparser';

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
		let local_files: Awaited<ReturnType<typeof parseTar>> | undefined;
		let package_json;
		let local_version = event.data.version;
		const starts_with_pr = local_version.startsWith('pr-');
		const starts_with_commit = local_version.startsWith('commit-');
		if (starts_with_pr || starts_with_commit) {
			const ref = starts_with_pr
				? local_version.substring('pr-'.length)
				: local_version.substring('commit-'.length);

			const maybe_tar = await fetch(`https://pkg.pr.new/svelte@${ref}`);
			if (maybe_tar.headers.get('content-type') === 'application/tar+gzip') {
				const buffer = await maybe_tar.arrayBuffer();
				local_files = await parseTar(buffer);
				const package_json_content = local_files.find(
					(file) => file.name === 'package/package.json'
				)?.text;
				if (package_json_content) {
					package_json = JSON.parse(package_json_content);
				}
			}
		}
		const { version } =
			package_json ?? (await fetch(`${svelte_url}/package.json`).then((r) => r.json()));
		if (version.startsWith('4.')) {
			// unpkg doesn't set the correct MIME type for .cjs files
			// https://github.com/mjackson/unpkg/issues/355
			const compiler =
				local_files?.find((file) => file.name === 'package/compiler.cjs')?.text ??
				(await fetch(`${svelte_url}/compiler.cjs`).then((r) => r.text()));
			(0, eval)(compiler + '\n//# sourceURL=compiler.cjs@' + version);
		} else if (version.startsWith('3.')) {
			const compiler =
				local_files?.find((file) => file.name === 'package/compiler.js')?.text ??
				(await fetch(`${svelte_url}/compiler.js`).then((r) => r.text()));
			(0, eval)(compiler + '\n//# sourceURL=compiler.js@' + version);
		} else {
			const compiler =
				local_files?.find((file) => file.name === 'package/compiler/index.js')?.text ??
				(await fetch(`${svelte_url}/compiler/index.js`).then((r) => r.text()));
			(0, eval)(compiler + '\n//# sourceURL=compiler/index.js@' + version);
		}

		fulfil_ready();
	}

	await ready;

	const { id, file, options } = event.data as {
		id: number;
		file: File;
		options: { generate: 'client' | 'server'; dev: boolean };
	};

	const fn = file.name.endsWith('.svelte') ? self.svelte.compile : self.svelte.compileModule;

	if (!fn) {
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
		const result = fn(file.contents, { ...options, filename: file.name });

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
