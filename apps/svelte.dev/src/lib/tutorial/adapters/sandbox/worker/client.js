// This module is served to the preview as `/@sandbox/client.js`, and implements
// (a subset of) Vite's `import.meta.hot` API. Updates are received from the
// sandbox worker over a BroadcastChannel

const channel = new BroadcastChannel('sandbox-hmr');

/** @type {Map<string, { callbacks: Array<(module: any) => void> }>} */
const hot_modules = new Map();

/** @type {Map<string, (data: any) => void | Promise<void>>} */
const dispose_map = new Map();

/** @type {Map<string, (data: any) => void | Promise<void>>} */
const prune_map = new Map();

/** @type {Map<string, any>} */
const data_map = new Map();

/** @type {Map<string, Set<(payload: any) => void>>} */
const listeners = new Map();

/** @param {string} id */
export function createHotContext(id) {
	if (!data_map.has(id)) data_map.set(id, {});

	// a new version of the module is being evaluated — clear stale callbacks
	const existing = hot_modules.get(id);
	if (existing) existing.callbacks = [];

	return {
		get data() {
			return data_map.get(id);
		},

		/**
		 * @param {any} [deps]
		 * @param {any} [callback]
		 */
		accept(deps, callback) {
			if (typeof deps === 'function' || !deps) {
				// self-accepting
				let mod = hot_modules.get(id);
				if (!mod) hot_modules.set(id, (mod = { callbacks: [] }));
				mod.callbacks.push((module) => deps?.(module));
			} else {
				console.warn(`[sandbox] import.meta.hot.accept(deps) is not supported`);
			}
		},

		/** @param {(data: any) => void} callback */
		dispose(callback) {
			dispose_map.set(id, callback);
		},

		/** @param {(data: any) => void} callback */
		prune(callback) {
			prune_map.set(id, callback);
		},

		invalidate() {
			location.reload();
		},

		/**
		 * @param {string} event
		 * @param {(payload: any) => void} callback
		 */
		on(event, callback) {
			let set = listeners.get(event);
			if (!set) listeners.set(event, (set = new Set()));
			set.add(callback);
		},

		/**
		 * @param {string} event
		 * @param {(payload: any) => void} callback
		 */
		off(event, callback) {
			listeners.get(event)?.delete(callback);
		},

		send() {}
	};
}

/**
 * @param {string} event
 * @param {any} payload
 */
function notify(event, payload) {
	listeners.get(event)?.forEach((fn) => fn(payload));
}

/** @type {Promise<void>} */
let queue = Promise.resolve();

/** @param {MessageEvent} event */
channel.onmessage = ({ data }) => {
	if (data.type === 'update') {
		queue = queue.then(async () => {
			notify('vite:beforeUpdate', { type: 'update', updates: data.updates });
			clear_overlay();

			for (const { id, url } of data.updates) {
				const mod = hot_modules.get(id);
				if (!mod) continue; // not used on this page

				const callbacks = mod.callbacks.slice();

				try {
					const dispose = dispose_map.get(id);
					if (dispose) await dispose(data_map.get(id));

					const module = await import(/* @vite-ignore */ url);

					for (const callback of callbacks) callback(module);
					console.debug(`[sandbox] hot updated: ${id}`);
				} catch (error) {
					console.error(error);
					show_overlay(/** @type {Error} */ (error).message);
				}
			}

			notify('vite:afterUpdate', { type: 'update', updates: data.updates });
		});
	} else if (data.type === 'full-reload') {
		location.reload();
	} else if (data.type === 'error') {
		show_overlay(data.message, data.frame);
	} else if (data.type === 'clear-error') {
		clear_overlay();
	}
};

/** @type {HTMLElement | null} */
let overlay = null;

/**
 * @param {string} message
 * @param {string} [frame]
 */
function show_overlay(message, frame) {
	clear_overlay();

	overlay = document.createElement('sandbox-error-overlay');
	overlay.style.cssText =
		'position: fixed; inset: 0; z-index: 99999; background: rgba(0, 0, 0, 0.66); display: flex; align-items: flex-start; justify-content: center; padding: 2rem; font-family: ui-monospace, monospace;';

	const box = document.createElement('div');
	box.style.cssText =
		'background: #181818; color: #eee; border-top: 4px solid #ff5555; padding: 1.5rem; max-width: 100%; overflow: auto; border-radius: 4px; font-size: 13px; line-height: 1.5; white-space: pre-wrap;';

	const heading = document.createElement('div');
	heading.style.cssText = 'color: #ff7777; margin-bottom: 1rem;';
	heading.textContent = message;
	box.append(heading);

	if (frame) {
		const pre = document.createElement('pre');
		pre.style.cssText = 'margin: 0; color: #ccc;';
		pre.textContent = frame;
		box.append(pre);
	}

	const hint = document.createElement('div');
	hint.style.cssText = 'margin-top: 1rem; color: #888;';
	hint.textContent = 'Click outside to dismiss';
	box.append(hint);

	overlay.append(box);
	overlay.addEventListener('click', (e) => {
		if (e.target === overlay) clear_overlay();
	});

	document.body.append(overlay);
}

function clear_overlay() {
	overlay?.remove();
	overlay = null;
}
