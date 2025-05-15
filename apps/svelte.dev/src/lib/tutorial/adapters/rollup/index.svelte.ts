import Bundler from '@sveltejs/repl/bundler';
// @ts-ignore package exports don't have types
import * as yootils from 'yootils';
import type { Adapter } from '$lib/tutorial';
import type { File, Item } from '@sveltejs/repl/workspace';

let done = false;
let svelte_version = 'latest';

export const state = new (class RollupState {
	progress = $state.raw({ value: 0, text: 'initialising' });
	bundler = new Bundler({
		svelte_version,
		onstatus: (val) => {
			if (!done && val === null) {
				done = true;
				this.progress = { value: 1, text: 'ready' };
			}
		},
		onversion: (version) => {
			svelte_version = version;
		}
	});
})();

export async function create(): Promise<Adapter> {
	state.progress = { value: 0.5, text: 'loading svelte compiler' };

	/** Paths and contents of the currently loaded file stubs */
	let current_files: Item[] = [];

	async function compile() {
		state.bundler.bundle(
			current_files
				// TODO we can probably remove all the SvelteKit specific stuff from the tutorial content once this settles down
				.filter((f): f is File => f.name.startsWith('/src/lib/') && f.type === 'file')
				.map((f) => ({ ...f, name: f.name.slice(9) })),
			{
				// TODO support Tailwind here?
				runes: true,
				svelte_version
			}
		);
	}

	const q = yootils.queue(1);

	return {
		reset: (files) => {
			return q.add(async () => {
				current_files = files;

				await compile();
				return false;
			});
		},
		update: (file) => {
			return q.add(async () => {
				current_files = current_files.map((old) => (old.name === file.name ? file : old));

				await compile();
				return false;
			});
		}
	};
}
