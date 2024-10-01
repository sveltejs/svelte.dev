import type { Adapter, FileStub, Stub, Warning } from '$lib/tutorial';
import Bundler from '@sveltejs/repl/bundler';
import type { Writable } from 'svelte/store';
// @ts-ignore package exports don't have types
import * as yootils from 'yootils';

/** Rollup bundler singleton */
let vm: Bundler;

/**
 * @param {import('svelte/store').Writable<any>} bundle
 * @param {import('svelte/store').Writable<Error | null>} error
 * @param {import('svelte/store').Writable<{ value: number, text: string }>} progress
 * @param {import('svelte/store').Writable<string[]>} logs
 * @param {import('svelte/store').Writable<Record<string, import('$lib/tutorial').Warning[]>>} warnings
 * @returns {Promise<import('$lib/tutorial').Adapter>}
 */
export async function create(
	bundle: Writable<any>,
	error: Writable<Error | null>, // TODO wire this up? Is this the correct place?
	progress: Writable<{ value: number; text: string }>,
	logs: Writable<string[]>, // TODO write to this somehow instead of the console viewer?
	warnings: Writable<Record<string, Warning[]>>
): Promise<Adapter> {
	progress.set({ value: 0, text: 'loading files' });

	let done = false;

	vm = new Bundler({
		packages_url: 'https://unpkg.com',
		svelte_url: `https://unpkg.com/svelte@next`, // TODO remove @next once 5.0 is released
		// svelte_url: `${browser ? location.origin : ''}/svelte`, // TODO think about bringing back main-build for Playground?
		onstatus(val) {
			if (!done && val === null) {
				done = true;
				progress.set({ value: 1, text: 'ready' });
			}
		}
	});

	progress.set({ value: 0.5, text: 'loading svelte compiler' });

	/** Paths and contents of the currently loaded file stubs */
	let current_stubs = stubs_to_map([]);

	async function compile() {
		const result = await vm.bundle(
			[...current_stubs.values()]
				// TODO we can probably remove all the SvelteKit specific stuff from the tutorial content once this settles down
				.filter((f): f is FileStub => f.name.startsWith('/src/lib/') && f.type === 'file')
				.map((f) => ({
					name: f.name.slice(9).split('.').slice(0, -1).join('.'),
					source: f.contents,
					type: f.name.split('.').pop() ?? 'svelte'
				}))
		);
		bundle.set(result);

		const _warnings: Record<string, any> = {};
		for (const warning of result?.warnings ?? []) {
			const file = '/src/lib/' + warning.filename;
			_warnings[file] = _warnings[file] || [];
			_warnings[file].push(warning);
		}
		warnings.set(_warnings);
	}

	const q = yootils.queue(1);

	return {
		reset: (stubs) => {
			return q.add(async () => {
				current_stubs = stubs_to_map(stubs, current_stubs);

				await compile();

				return false;
			});
		},
		update: (file) => {
			return q.add(async () => {
				current_stubs.set(file.name, file);

				await compile();

				return false;
			});
		}
	};
}

function stubs_to_map(files: Stub[], map = new Map<string, Stub>()) {
	for (const file of files) {
		map.set(file.name, file);
	}
	return map;
}
