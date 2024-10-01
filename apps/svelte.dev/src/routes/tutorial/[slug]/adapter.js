import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { page } from '$app/stores';

export const progress = writable({
	value: 0,
	text: 'initialising'
});

/** @type {import('svelte/store').Writable<string | null>} The base URL pointing to the webcontainer instance. Not relevant for Rollup */
export const base = writable(null);

/** @type {import('svelte/store').Writable<any>} The bundle result of the rollup web worker. Not relevant for web containers */
export const bundle = writable(null);

/** @type {import('svelte/store').Writable<Error | null>} Errors related to the webcontainer/web worker itself (most likely during startup) */
export const error = writable(null);

/** @type {import('svelte/store').Writable<string[]>} Logs for the terminal view */
export const logs = writable([]);

/** @type {import('svelte/store').Writable<Record<string, import('$lib/tutorial').Warning[]>>} Warnings from Svelte compiler */
export const warnings = writable({});

/** @type {Promise<import('$lib/tutorial').Adapter> | undefined} */
let wc_ready;
/** @type {Promise<import('$lib/tutorial').Adapter> | undefined} */
let rollup_ready;

let initial_load = true;
let use_rollup = true;

if (browser) {
	page.subscribe(($page) => {
		const slug = $page.data?.exercise?.part?.slug;
		if (slug) {
			use_rollup = /svelte$/.test(slug);

			if (use_rollup) {
				load_rollup();
			} else {
				load_webcontainer();
			}

			initial_load = false;
		}
	});
}

export function load_webcontainer(force = false) {
	if (!force && wc_ready) return wc_ready;

	wc_ready = new Promise(async (fulfil, reject) => {
		try {
			// TODO: remove this when webcontainers are properly supported on iOS
			// see https://github.com/stackblitz/webcontainer-core/issues/1120
			if (initial_load && /iphone/i.test(navigator.userAgent)) {
				throw new Error('iOS does not support WebContainers');
			}

			const module = await import('$lib/tutorial/adapters/webcontainer/index.js');
			const adapter = await module.create(base, error, progress, logs, warnings);

			fulfil(adapter);
		} catch (error) {
			reject(error);
		}
	});
	return wc_ready;
}

export function load_rollup(force = false) {
	if (!force && rollup_ready) return rollup_ready;

	rollup_ready = new Promise(async (fulfil, reject) => {
		try {
			const module = await import('$lib/tutorial/adapters/rollup/index');
			const adapter = await module.create(bundle, error, progress, logs, warnings);

			fulfil(adapter);
		} catch (error) {
			reject(error);
		}
	});
	return rollup_ready;
}

/** @typedef {'reload'} EventName */

/** @type {Map<EventName, Set<() => void>>} */
let subscriptions = new Map([['reload', new Set()]]);

/**
 *
 * @param {EventName} event
 * @param {() => void} callback
 */
export function subscribe(event, callback) {
	subscriptions.get(event)?.add(callback);

	return () => {
		subscriptions.get(event)?.delete(callback);
	};
}

/**
 * @param {EventName} event
 */
function publish(event) {
	subscriptions.get(event)?.forEach((fn) => fn());
}

/**
 * @param {import('$lib/tutorial').Stub[]} files
 */
export async function reset(files) {
	try {
		const adapter = await get_adapter();
		const should_reload = await adapter.reset(files);

		if (should_reload) {
			publish('reload');
		}

		error.set(null);
	} catch (e) {
		error.set(/** @type {Error} */ (e));
	}
}

/**
 * @param {import('$lib/tutorial').FileStub} file
 */
export async function update(file) {
	const adapter = await get_adapter();
	const should_reload = await adapter.update(file);

	if (should_reload) {
		publish('reload');
	}
}

async function get_adapter() {
	return use_rollup ? load_rollup() : load_webcontainer();
}
