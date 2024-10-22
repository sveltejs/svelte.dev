import { BROWSER } from 'esm-env';
import CompileWorker from './worker?worker';
import type { Compiled, File } from '../Workspace.svelte';

const callbacks = new Map<number, (compiled: Compiled) => void>();

let worker: Worker;

let uid = 1;

if (BROWSER) {
	worker = new CompileWorker();

	worker.addEventListener('message', (event) => {
		const callback = callbacks.get(event.data.id);

		if (callback) {
			callback(event.data.payload);
			callbacks.delete(event.data.id);
		}
	});
}

export function compile_file(
	file: File,
	version: string,
	options: { generate: 'client' | 'server'; dev: boolean }
): Promise<Compiled> {
	// @ts-ignore
	if (!BROWSER) return;

	let id = uid++;

	worker.postMessage({ id, file, version, options });

	return new Promise((fulfil) => {
		callbacks.set(id, fulfil);
	});
}
