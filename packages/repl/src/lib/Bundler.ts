import type { BundleMessageData, BundleResult } from './workers/workers';
import type { File } from './Workspace.svelte';

let uid = 1;

export default class Bundler {
	#worker: Worker;
	#handlers = new Map<number, (data: BundleMessageData) => void>(); // TODO this is leaky, we don't always remove handlers

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

		this.#worker.onmessage = (event: MessageEvent<BundleMessageData>) => {
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

			const handler = this.#handlers.get(event.data.uid)!;
			this.#handlers.delete(event.data.uid);

			handler(event.data);
		};

		this.#worker.postMessage({ type: 'init', svelte_version });
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
