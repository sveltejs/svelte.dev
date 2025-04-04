import type { BundleResult } from './public';
import type { File } from './Workspace.svelte';

let uid = 1;

export default class Bundler {
	#worker: Worker;

	result = $state.raw<BundleResult | null>(null);

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

		this.#worker.onmessage = (event) => {
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
			this.result = event.data;
		};

		this.#worker.postMessage({ type: 'init', svelte_version });
	}

	bundle(files: File[], options: { tailwind?: boolean }) {
		this.#worker.postMessage({
			uid,
			type: 'bundle',
			files,
			options
		});

		uid += 1;
	}
}
