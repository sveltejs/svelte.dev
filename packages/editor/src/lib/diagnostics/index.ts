import { BROWSER } from 'esm-env';
import DiagnosticsWorker from './worker?worker';
import type { Diagnostics, File } from '../Workspace.svelte';

const callbacks = new Map<number, (diagnostics: Diagnostics) => void>();

let worker: Worker;

let uid = 1;

if (BROWSER) {
	worker = new DiagnosticsWorker();

	worker.addEventListener('message', (event) => {
		const callback = callbacks.get(event.data.id);

		if (callback) {
			callback(event.data.payload);
			callbacks.delete(event.data.id);
		}
	});
}

export function get_diagnostics(file: File): Promise<Diagnostics> {
	if (!BROWSER) {
		// TODO this is a bit janky
		return Promise.resolve({
			error: null,
			warnings: []
		});
	}

	let id = uid++;

	worker.postMessage({ id, file });

	return new Promise((fulfil) => {
		callbacks.set(id, fulfil);
	});
}
