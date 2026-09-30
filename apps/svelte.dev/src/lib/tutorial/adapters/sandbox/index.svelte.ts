// An alternative to the WebContainer adapter, which runs a (subset of a) SvelteKit
// dev server in the browser. The pieces:
//
// - a hidden 'relay' iframe on a separate 'sandbox' origin, which registers a
//   service worker and creates the sandbox worker
// - the service worker (apps/sandbox/public/__sandbox_sw.js), which intercepts requests from
//   the preview iframe (also on the sandbox origin) and forwards them to the worker
// - the sandbox worker (./worker), which holds the files in memory, compiles them,
//   and runs SvelteKit's server runtime
//
// This page talks to the worker directly, via a MessagePort

import worker_url from './worker/index.ts?worker&url';
import { escape_html } from '../../../utils/escape.js';
import type { Adapter } from '#lib/tutorial/index.d.ts';
import type { File, Item } from '@sveltejs/repl/workspace';

/**
 * The version of the protocol spoken between this page, the relay, the service worker
 * and the sandbox worker. Must match `VERSION` in `apps/sandbox/public/__sandbox/relay.html`
 */
const VERSION = 1;

export const state = new (class SandboxState {
	progress = $state.raw({ value: 0, text: 'initialising' });
	base = $state.raw<string | null>(null);
	error = $state.raw<Error | null>(null);
	logs = $state.raw<string[]>([]);
})();

/**
 * The preview must live on a different origin to the tutorial itself, both so
 * that it can own the root path (tutorial code uses root-relative URLs) and for
 * security. Each session gets its own subdomain, so that multiple tabs don't
 * share a service worker. In production this is `*.svelte-sandbox.link`, which
 * serves `apps/sandbox` — locally, we use `*.localhost` (which browsers resolve
 * to loopback) and the svelte.dev dev server serves `apps/sandbox` itself
 */
function get_sandbox_origin() {
	const local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);

	const template = local
		? `${location.protocol}//*.localhost:${location.port}`
		: 'https://*.svelte-sandbox.link';

	const id = Math.random().toString(36).slice(2, 12);
	return template.replace('*', id);
}

let relay: HTMLIFrameElement | null = null;

export async function create(): Promise<Adapter> {
	const origin = get_sandbox_origin();

	state.progress = { value: 0, text: 'starting sandbox' };
	state.error = null;

	relay?.remove();
	relay = document.createElement('iframe');
	relay.title = 'sandbox relay';
	relay.style.cssText = 'position: absolute; width: 0; height: 0; border: 0; visibility: hidden';
	relay.src = `${origin}/__sandbox/relay.html?parent=${encodeURIComponent(location.origin)}`;

	const relay_ready = new Promise<void>((fulfil, reject) => {
		const handler = (e: MessageEvent) => {
			if (e.origin !== origin || e.source !== relay?.contentWindow) return;

			if (e.data.type === 'relay-ready') {
				fulfil();
			} else if (e.data.type === 'relay-error') {
				state.error = new Error(e.data.message);
				reject(state.error);
			}
		};

		window.addEventListener('message', handler);
	});

	document.body.append(relay);
	await relay_ready;

	state.progress = { value: 0.1, text: 'starting worker' };

	const channel = new MessageChannel();
	const port = channel.port1;

	let uid = 1;
	const pending = new Map<number, { fulfil: (value: any) => void; reject: (e: Error) => void }>();

	const booted = new Promise<void>((fulfil, reject) => {
		port.onmessage = (e) => {
			const data = e.data;

			switch (data.type) {
				case 'status':
					state.progress = { value: data.value, text: data.text };
					break;

				case 'booted':
					fulfil();
					break;

				case 'fatal':
					state.error = new Error(data.message);
					reject(state.error);
					break;

				case 'log':
					state.logs = [
						...state.logs,
						`<span class="${data.level}">${escape_html(data.text).replace(/\n/g, '<br>')}</span>`
					];
					break;

				case 'result': {
					const callbacks = pending.get(data.id);
					pending.delete(data.id);
					if (data.error) callbacks?.reject(new Error(data.error));
					else callbacks?.fulfil(data.result);
					break;
				}
			}
		};
	});

	relay.contentWindow!.postMessage(
		{
			type: 'init',
			version: VERSION,
			worker: new URL(worker_url, location.href).href,
			port: channel.port2
		},
		origin,
		[channel.port2]
	);

	await booted;

	function send(type: string, payload: Record<string, any>): Promise<boolean> {
		const id = uid++;
		return new Promise((fulfil, reject) => {
			pending.set(id, { fulfil, reject });
			port.postMessage({ type, id, ...payload });
		});
	}

	let first = true;

	return {
		async reset(items: Item[]) {
			const files = items.filter((item): item is File => item.type === 'file').map(to_file);
			const result = await send('reset', { files });

			if (first) {
				first = false;
				state.progress = { value: 1, text: 'ready' };
				state.base = origin;
			}

			return result;
		},
		async update(file: File) {
			return send('update', { file: to_file(file) });
		}
	};
}

function to_file(file: File): File {
	// special case — inject the script that talks to the tutorial page
	if (file.name === '/src/app.html' || file.name === '/src/error.html') {
		return {
			...file,
			contents: file.contents + '<script type="module" src="/src/__client.js"></script>'
		};
	}

	return {
		type: 'file',
		name: file.name,
		basename: file.basename,
		contents: file.contents,
		text: file.text
	};
}
