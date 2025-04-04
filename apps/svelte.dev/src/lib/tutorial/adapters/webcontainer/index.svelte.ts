import { WebContainer, type DirectoryNode, type FileSystemTree } from '@webcontainer/api';
import base64 from 'base64-js';
import AnsiToHtml from 'ansi-to-html';
// @ts-ignore package exports don't have types
import * as yootils from 'yootils';
import { get_depth } from '../../../utils/path.js';
import { escape_html } from '../../../utils/escape.js';
import { ready } from '../common/index.js';
import type { Adapter } from '$lib/tutorial';
import type { Item, File } from '@sveltejs/repl/workspace';

const converter = new AnsiToHtml({
	fg: 'var(--sk-fg-3)'
});

/** Web container singleton */
let vm: WebContainer;

export const state = new (class WCState {
	progress = $state.raw({ value: 0, text: 'initialising' });
	base = $state.raw<string | null>(null);
	error = $state.raw<Error | null>(null);
	logs = $state.raw<string[]>([]);
})();

export async function create(): Promise<Adapter> {
	state.progress = { value: 0, text: 'loading files' };

	const q = yootils.queue(1);
	const q_per_file = new Map<string, Array<File>>();

	/** Paths and contents of the currently loaded file stubs */
	let current_stubs = stubs_to_map([]);

	state.progress = { value: 1 / 5, text: 'booting webcontainer' };
	vm = await WebContainer.boot();

	state.progress = { value: 2 / 5, text: 'writing virtual files' };
	const common = await ready;
	await vm.mount({
		'common.zip': {
			file: { contents: new Uint8Array(common.zipped) }
		},
		'unzip.cjs': {
			file: { contents: common.unzip }
		}
	});

	const log_stream = () =>
		new WritableStream({
			write(chunk) {
				if (chunk === '\x1B[1;1H') {
					// clear screen
					state.logs = [];
				} else if (chunk?.startsWith('svelte:warnings:')) {
					// TODO when does this happen?
				} else {
					const log = converter.toHtml(escape_html(chunk)).replace(/\n/g, '<br>');
					state.logs = [...state.logs, log];
				}
			}
		});

	state.progress = { value: 3 / 5, text: 'unzipping files' };
	const unzip = await vm.spawn('node', ['unzip.cjs']);
	unzip.output.pipeTo(log_stream());
	const code = await unzip.exit;

	if (code !== 0) {
		throw new Error('Failed to initialize WebContainer');
	}

	await vm.spawn('chmod', ['a+x', 'node_modules/vite/bin/vite.js']);

	vm.on('server-ready', (_port, url) => {
		state.base = url;
	});

	vm.on('error', ({ message }) => {
		state.error = new Error(message);
	});

	let launched = false;

	async function launch() {
		if (launched) return;
		launched = true;

		state.progress = { value: 4 / 5, text: 'starting dev server' };

		await new Promise(async (fulfil, reject) => {
			const error_unsub = vm.on('error', (error) => {
				error_unsub();
				reject(new Error(error.message));
			});

			const ready_unsub = vm.on('server-ready', (_port, base) => {
				ready_unsub();
				state.progress = { value: 5 / 5, text: 'ready' };
				fulfil(base); // this will be the last thing that happens if everything goes well
			});

			await run_dev();

			async function run_dev() {
				const process = await vm.spawn('npm', ['run', 'dev']);

				// TODO differentiate between stdout and stderr (sets `vite_error` to `true`)
				// https://github.com/stackblitz/webcontainer-core/issues/971
				process.output.pipeTo(log_stream());

				// keep restarting dev server (can crash in case of illegal +files for example)
				await process.exit;
				run_dev();
			}
		});
	}

	return {
		reset: (stubs) => {
			return q.add(async () => {
				const to_write: Item[] = [];

				const force_delete = [];

				for (const stub of stubs) {
					if (stub.name.endsWith('/__delete')) {
						force_delete.push(stub.name.slice(0, -9));
					} else if (stub.type === 'file') {
						if (stub.contents.startsWith('__delete')) {
							force_delete.push(stub.name);
							continue;
						}

						const current = current_stubs.get(stub.name) as File;

						if (current?.contents !== stub.contents) {
							to_write.push(stub);
						}
					} else {
						// always add directories, otherwise convert_stubs_to_tree will fail
						to_write.push(stub);
					}

					current_stubs.delete(stub.name);
				}

				// Don't delete the node_modules folder when switching from one exercise to another
				// where, as this crashes the dev server.
				const to_delete = [
					...Array.from(current_stubs.keys()).filter((s) => !s.startsWith('/node_modules')),
					...force_delete
				];

				current_stubs = stubs_to_map(stubs);

				// For some reason, server-ready is fired again when the vite dev server is restarted.
				// We need to wait for it to finish before we can continue, else we might
				// request files from Vite before it's ready, leading to a timeout.
				const will_restart =
					launched && (to_write.some(is_config) || to_delete.some(is_config_path));
				const promise = will_restart ? wait_for_restart_vite() : Promise.resolve();

				for (const file of to_delete) {
					await vm.fs.rm(file, { force: true, recursive: true });
				}

				const tree = convert_stubs_to_tree(to_write);

				await vm.mount(tree);
				await promise;
				await new Promise((f) => setTimeout(f, 200)); // wait for chokidar

				// Also trigger a reload of the iframe in case new files were added / old ones deleted,
				// because that can result in a broken UI state
				const should_reload = !launched || will_restart || to_delete.length > 0;

				await launch();

				return should_reload;
			});
		},
		update: (file) => {
			let queue = q_per_file.get(file.name);
			if (queue) {
				queue.push(file);
				return Promise.resolve(false);
			}

			q_per_file.set(file.name, (queue = [file]));

			return q.add(async () => {
				const root: FileSystemTree = {};

				let tree = root;

				const path = file.name.split('/').slice(1);
				const basename = path.pop()!;

				for (const part of path) {
					if (!tree[part]) {
						const directory: FileSystemTree = {};

						tree[part] = {
							directory
						};
					}

					tree = (tree[part] as DirectoryNode).directory;
				}

				const will_restart = is_config(file);

				while (queue && queue.length > 0) {
					// if the file is updated many times rapidly, get the most recently updated one
					const file = queue.pop()!;
					queue.length = 0;

					tree[basename] = to_file(file);

					await vm.mount(root);

					if (will_restart) await wait_for_restart_vite();

					current_stubs.set(file.name, file);

					// we need to stagger sequential updates, just enough that the HMR
					// wires don't get crossed. 50ms seems to be enough of a delay
					// to avoid glitches without noticeably affecting update speed
					await new Promise((f) => setTimeout(f, 50));
				}

				q_per_file.delete(file.name);

				return will_restart;
			});
		}
	};
}

function is_config(file: Item) {
	return file.type === 'file' && is_config_path(file.name);
}

function is_config_path(path: string) {
	return ['/vite.config.js', '/svelte.config.js', '/.env'].includes(path);
}

function wait_for_restart_vite() {
	return new Promise((fulfil, reject) => {
		const error_unsub = vm.on('error', (error) => {
			error_unsub();
			reject(new Error(error.message));
		});

		const ready_unsub = vm.on('server-ready', (port, base) => {
			ready_unsub();
			console.log(`server ready on port ${port} at ${performance.now()}: ${base}`);
			fulfil(undefined);
		});

		setTimeout(() => {
			reject(new Error('Timed out resetting WebContainer'));
		}, 10000);
	});
}

function convert_stubs_to_tree(stubs: Item[], depth = 1) {
	const tree: FileSystemTree = {};

	for (const stub of stubs) {
		if (get_depth(stub.name) === depth) {
			if (stub.type === 'directory') {
				const children = stubs.filter((child) => child.name.startsWith(stub.name));

				tree[stub.basename] = {
					directory: convert_stubs_to_tree(children, depth + 1)
				};
			} else {
				tree[stub.basename] = to_file(stub);
			}
		}
	}

	return tree;
}

function to_file(file: File) {
	// special case
	if (file.name === '/src/app.html' || file.name === '/src/error.html') {
		const contents = file.contents + '<script type="module" src="/src/__client.js"></script>';

		return {
			file: { contents }
		};
	}

	const contents = file.text ? file.contents : base64.toByteArray(file.contents);

	return {
		file: { contents }
	};
}

function stubs_to_map(files: Item[], map = new Map<string, Item>()) {
	for (const file of files) {
		map.set(file.name, file);
	}
	return map;
}
