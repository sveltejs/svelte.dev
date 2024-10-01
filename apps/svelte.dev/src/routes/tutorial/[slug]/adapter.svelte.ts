import { browser } from '$app/environment';
import { page } from '$app/stores';
import type { state as wc_state } from '$lib/tutorial/adapters/webcontainer/index.svelte.js';
import type { state as rollup_state } from '$lib/tutorial/adapters/rollup/index.svelte';
import type { Adapter, FileStub, Stub } from '$lib/tutorial';

let initial_load = true;
let use_rollup = $state(true);

export const adapter_state = new (class {
	rollup_state = $state.raw<typeof rollup_state>({} as any);
	wc_state = $state.raw<typeof wc_state>({} as any);
	internal_error = $state.raw<Error | null>(null);

	base = $derived(this.wc_state.base);
	bundle = $derived(this.rollup_state.bundle);
	error = $derived(
		(use_rollup ? this.rollup_state.error : this.wc_state.error) || this.internal_error
	);
	logs = $derived((use_rollup ? this.rollup_state.logs : this.wc_state.logs) || []);
	progress = $derived(
		(use_rollup ? this.rollup_state.progress : this.wc_state.progress) || {
			value: 0,
			status: 'initialising'
		}
	);
	warnings = $derived((use_rollup ? this.rollup_state.warnings : this.wc_state.warnings) || {});
})();

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

let wc_ready: Promise<Adapter> | undefined;

export function load_webcontainer(force = false) {
	if (!force && wc_ready) return wc_ready;

	wc_ready = new Promise(async (fulfil, reject) => {
		try {
			// TODO: remove this when webcontainers are properly supported on iOS
			// see https://github.com/stackblitz/webcontainer-core/issues/1120
			if (initial_load && /iphone/i.test(navigator.userAgent)) {
				throw new Error('iOS does not support WebContainers');
			}

			const module = await import('$lib/tutorial/adapters/webcontainer/index.svelte.js');
			adapter_state.wc_state = module.state;
			const adapter = await module.create();

			fulfil(adapter);
		} catch (error) {
			reject(error);
		}
	});
	return wc_ready;
}

let rollup_ready: Promise<Adapter> | undefined;

export function load_rollup(force = false) {
	if (!force && rollup_ready) return rollup_ready;

	rollup_ready = new Promise(async (fulfil, reject) => {
		try {
			const module = await import('$lib/tutorial/adapters/rollup/index.svelte');
			adapter_state.rollup_state = module.state;
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

export async function reset(files: Stub[]) {
	try {
		const adapter = await get_adapter();
		const should_reload = await adapter.reset(files);

		if (should_reload) {
			publish('reload');
		}

		adapter_state.internal_error = null;
	} catch (e) {
		adapter_state.internal_error = e as Error;
	}
}

export async function update(file: FileStub) {
	const adapter = await get_adapter();
	const should_reload = await adapter.update(file);

	if (should_reload) {
		publish('reload');
	}
}

async function get_adapter() {
	return use_rollup ? load_rollup() : load_webcontainer();
}
