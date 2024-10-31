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
	#is_pkg_pr_new: boolean;

	constructor({
		packages_url,
		svelte_url,
		onstatus,
		is_pkg_pr_new
	}: {
		packages_url: string;
		svelte_url: string;
		onstatus: (val: string | null) => void;
		is_pkg_pr_new?: boolean;
	}) {
		this.hash = `${packages_url}:${svelte_url}`;
		this.#is_pkg_pr_new = is_pkg_pr_new;

		if (!workers.has(this.hash)) {
			const worker = new Worker();
			worker.postMessage({ type: 'init', packages_url, svelte_url, is_pkg_pr_new });
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

	bundle(files: File[], options: CompileOptions = {}): Promise<BundleResult> {
		return new Promise<any>((fulfil) => {
			this.handlers.set(uid, fulfil);
			this.worker.postMessage({
				uid,
				type: 'bundle',
				files,
				options,
				is_pkg_pr_new: this.#is_pkg_pr_new
			});

			uid += 1;
		});
	}

	destroy() {
		this.worker.terminate();
		workers.delete(this.hash);
	}
}
