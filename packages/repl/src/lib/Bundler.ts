import type { File } from './types';
import Worker from './workers/bundler/index.js?worker';
import type { BundleMessageData } from './workers/workers';

const workers = new Map();

let uid = 1;

export default class Bundler {
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
		const hash = `${packages_url}:${svelte_url}`;

		if (!workers.has(hash)) {
			const worker = new Worker();
			worker.postMessage({ type: 'init', packages_url, svelte_url });
			workers.set(hash, worker);
		}

		this.worker = workers.get(hash);

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

	bundle(files: File[]) {
		return new Promise((fulfil) => {
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
	}
}
