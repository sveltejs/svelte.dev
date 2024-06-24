import type { File } from '$lib/types';
import type { CompileOptions } from 'svelte/compiler';
import Worker from '../workers/compiler/index.js?worker';
import type { CompilerOutput, MigrateOutput } from '$lib/workers/workers';

const workers = new Map();

let uid = 1;

export default class Compiler {
	worker: Worker;
	handlers: Map<number, (...arg: any) => void> = new Map();

	constructor(svelte_url: string) {
		if (!workers.has(svelte_url)) {
			const worker = new Worker();
			worker.postMessage({ type: 'init', svelte_url });
			workers.set(svelte_url, worker);
		}

		this.worker = workers.get(svelte_url);

		this.worker.addEventListener('message', (event: MessageEvent<any>) => {
			const handler = this.handlers.get(event.data.id);

			if (handler) {
				// if no handler, was meant for a different REPL
				handler(event.data.result);
				this.handlers.delete(event.data.id);
			}
		});
	}

	compile(file: File, options: CompileOptions, return_ast: boolean): Promise<CompilerOutput> {
		return new Promise((fulfil) => {
			const id = uid++;

			this.handlers.set(id, fulfil);

			this.worker.postMessage({
				id,
				type: 'compile',
				payload: {
					source: file.source,
					options: Object.assign(
						{
							name: file.name,
							filename: `${file.name}.${file.type}`
						},
						options
					),
					entry: file.name === 'App',
					return_ast
				}
			});
		});
	}

	migrate(file: File): Promise<MigrateOutput> {
		return new Promise((fulfil) => {
			const id = uid++;

			this.handlers.set(id, fulfil);

			this.worker.postMessage({
				id,
				type: 'migrate',
				payload: {
					source: file.source
				}
			});
		});
	}

	destroy() {
		this.worker.terminate();
	}
}
