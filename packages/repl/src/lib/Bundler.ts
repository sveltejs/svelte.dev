import type { BundleResult } from './workers/bundler';
import type { BundleMessageData } from './workers/workers';
import type { File } from 'editor';

let uid = 1;

export default class Bundler {
	#worker: Worker;
	#handlers = new Map<number, (data: BundleMessageData) => void>();

	constructor({
		svelte_version,
		onstatus,
		onversion,
		onerror
	}: {
		svelte_version: string;
		onstatus: (val: string | null) => void;
		onversion?: (version: string) => void;
		onerror?: (message: string) => void;
	}) {
		this.#worker = new Worker(new URL('./workers/bundler/index', import.meta.url), {
			type: 'module'
		});

		this.#worker.postMessage({ type: 'init', svelte_version });

		this.#worker.addEventListener('message', (event: MessageEvent<BundleMessageData>) => {
			if (event.data.type === 'status') {
				onstatus(event.data.message);
				return;
			}

			if (event.data.type === 'version') {
				onversion?.(event.data.message);
				return;
			}

			if (event.data.type === 'error') {
				onerror?.(event.data.message);
				return;
			}

			onstatus(null);

			const handler = this.#handlers.get(event.data.uid);
			this.#handlers.delete(event.data.uid);

			handler(event.data);
		});
	}

	bundle(files: File[], options: { tailwind?: boolean }): Promise<BundleResult> {
		return new Promise<any>((fulfil) => {
			this.#handlers.set(uid, fulfil);

			this.#worker.postMessage({
				uid,
				type: 'bundle',
				files,
				options
			});

			uid += 1;
		});
	}
}
