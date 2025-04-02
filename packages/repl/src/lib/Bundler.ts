import type { BundleResult } from './workers/bundler';
import type { BundleMessageData } from './workers/workers';
import type { File } from 'editor';

const workers = new Map();

let uid = 1;

export default class Bundler {
	worker: Worker;
	handlers: Map<number, (data: BundleMessageData) => void>;

	constructor({
		svelte_version,
		onstatus,
		onerror
	}: {
		svelte_version: string;
		onstatus: (val: string | null) => void;
		onerror?: (message: string) => void;
	}) {
		if (!workers.has(svelte_version)) {
			const worker = new Worker(new URL('./workers/bundler/index', import.meta.url), {
				type: 'module'
			});

			worker.postMessage({ type: 'init', svelte_version });
			workers.set(svelte_version, worker);
		}

		this.worker = workers.get(svelte_version);

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
}
