import type { File } from './types';
import type { BundleResult } from './workers/bundler';
import Worker from './workers/bundler/index.js?worker';
import type { BundleMessageData } from './workers/workers';

const workers = new Map();

let uid = 1;

export default class Bundler {
	hash: string;
	worker: Worker;
	handlers: Map<number, (data: BundleMessageData) => void>;

	constructor({
		packages_url,
		svelte_url,
		onstatus
	}: {
		packages_url: string;
		svelte_url: string;
		onstatus: (val: string | null) => void;
	}) {
		this.hash = `${packages_url}:${svelte_url}`;

		if (!workers.has(this.hash)) {
			const worker = new Worker();
			worker.postMessage({ type: 'init', packages_url, svelte_url });
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

				onstatus(null);
				handler(event.data);
				this.handlers.delete(event.data.uid);
			}
		});
	}

	bundle(files: File[]): Promise<BundleResult> {
		return new Promise<any>((fulfil) => {
			this.handlers.set(uid, fulfil);

			this.worker.postMessage({
				uid,
				type: 'bundle',
				files
			});

			uid += 1;
		});
	}

	destroy() {
		this.worker.terminate();
		workers.delete(this.hash);
	}
}
