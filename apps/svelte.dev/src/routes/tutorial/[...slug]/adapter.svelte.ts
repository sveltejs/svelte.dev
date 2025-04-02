import { browser } from '$app/environment';
import { page } from '$app/stores';
import type { state as WCState } from '$lib/tutorial/adapters/webcontainer/index.svelte';
import type { state as RollupState } from '$lib/tutorial/adapters/rollup/index.svelte';
import type { Adapter } from '$lib/tutorial';
import type { File, Item } from '@sveltejs/repl/workspace';
import { needs_webcontainers } from './shared';

let initial_load = true;
let use_rollup = $state(true);

let rollup_state = $state.raw<typeof RollupState>({} as any);
let wc_state = $state.raw<typeof WCState>({} as any);
let internal_error = $state.raw<Error | null>(null);

export const adapter_state = new (class {
	/** URL to the web container instance. Irrelevant for Rollup */
	base = $derived(wc_state.base);
	/** Errors from within the web container instance. Irrelevant for Rollup */
	error = $derived(wc_state.error || internal_error);
	/** Logs from the web container instance. Irrelevant for Rollup */
	logs = $derived(wc_state.logs || []);

	/** Irrelevant for web containers */
	bundler = $derived(rollup_state.bundler);

	/** Startup progress */
	progress = $derived(
		(use_rollup ? rollup_state.progress : wc_state.progress) || {
			value: 0,
			status: 'initialising'
		}
	);
})();

if (browser) {
	page.subscribe(($page) => {
		const exercise = $page.data?.exercise;
		if (exercise) {
			use_rollup = !needs_webcontainers(exercise);

			if (use_rollup) {
				load_rollup();
			} else {
				load_webcontainer();
			}

			initial_load = false;
		}
	});
}

let wc_ready: Promise<Adapter> | undefined = undefined;

export function load_webcontainer(force = false) {
	if (!force && wc_ready) return wc_ready;

	wc_ready = new Promise(async (fulfil, reject) => {
		try {
			// TODO: remove this when webcontainers are properly supported on iOS
			// see https://github.com/stackblitz/webcontainer-core/issues/1120
			if (initial_load && /iphone/i.test(navigator.userAgent)) {
				throw new Error('iOS does not support WebContainers');
			}

			const module = await import('$lib/tutorial/adapters/webcontainer/index.svelte');
			wc_state = module.state;
			const adapter = await module.create();

			fulfil(adapter);
		} catch (error) {
			reject(error);
		}
	});
	return wc_ready;
}

let rollup_ready: Promise<Adapter> | undefined = undefined;

export function load_rollup(force = false) {
	if (!force && rollup_ready) return rollup_ready;

	rollup_ready = new Promise(async (fulfil, reject) => {
		try {
			const module = await import('$lib/tutorial/adapters/rollup/index.svelte');
			rollup_state = module.state;
			const adapter = await module.create();

			fulfil(adapter);
		} catch (error) {
			reject(error);
		}
	});
	return rollup_ready;
}

type EventName = 'reload';

let subscriptions = new Map<EventName, Set<() => void>>([['reload', new Set()]]);

export function subscribe(event: EventName, callback: () => void) {
	subscriptions.get(event)?.add(callback);

	return () => {
		subscriptions.get(event)?.delete(callback);
	};
}

function publish(event: EventName) {
	subscriptions.get(event)?.forEach((fn) => fn());
}

export async function reset(files: Item[]) {
	try {
		const adapter = await get_adapter();
		const should_reload = await adapter.reset(files);

		if (should_reload) {
			publish('reload');
		}

		internal_error = null;
	} catch (e) {
		internal_error = e as Error;
	}
}

export async function update(file: File) {
	const adapter = await get_adapter();
	const should_reload = await adapter.update(file);

	if (should_reload) {
		publish('reload');
	}
}

async function get_adapter() {
	return use_rollup ? load_rollup() : load_webcontainer();
}
