import type { CompileOptions } from 'svelte/compiler';
import type { BundleResult } from './workers/bundler';
import Worker from './workers/bundler/index.js?worker';
import type { BundleMessageData } from './workers/workers';
import type { File } from 'editor';

const workers = new Map();

let uid = 1;

export default class Bundler {
	hash: string;
	worker: Worker;
	handlers: Map<number, (data: BundleMessageData) => void>;

	constructor({
		packages_url,
		svelte_version,
		onstatus,
		onerror
	}: {
		packages_url: string;
		svelte_version: string;
		onstatus: (val: string | null) => void;
		onerror?: (message: string) => void;
	}) {
		this.hash = `${packages_url}:${svelte_version}`;

		if (!workers.has(this.hash)) {
			const worker = new Worker();
			worker.postMessage({ type: 'init', packages_url, svelte_version });
			workers.set(this.hash, worker);
		}

		this.worker = workers.get(this.hash);

		this.handlers = new Map();

		this.worker.addEventListener('message', (event: MessageEvent<BundleMessageData>) => {
			const handler = this.handlers.get(event.data.uid);

			if (handler) {
				// if no handler, was meant for a different REPL
				if (event.data.type === 'status') {
					onstatus(event.data.message);
					return;
				}

				if (event.data.type === 'error') {
					onerror?.(event.data.message);
					return;
				}

				onstatus(null);
				handler(event.data);
				this.handlers.delete(event.data.uid);
			}
		});
	}

	bundle(files: File[], options: { tailwind?: boolean }): Promise<BundleResult> {
		return new Promise<any>((fulfil) => {
			this.handlers.set(uid, fulfil);
			this.worker.postMessage({
				uid,
				type: 'bundle',
				files,
				options
			});

			uid += 1;
		});
	}

	destroy() {
		this.worker.terminate();
		workers.delete(this.hash);
	}
}
