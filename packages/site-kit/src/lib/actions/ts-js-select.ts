import { page } from '$app/stores';
import { mount, unmount } from 'svelte';
import TsJsSelect from '../docs/TsJsSelect.svelte';

const map = new WeakMap();

export function ts_js_select(node: HTMLElement) {
	let blocks: Element[];

	function update() {
		blocks = [
			...node.querySelectorAll('div.ts-version'),
			...node.querySelectorAll('div.js-version')
		];

		// Add a select to each code block
		for (const block of blocks) {
			map.set(
				block,
				mount(TsJsSelect, {
					target: block
				})
			);
		}
	}

	function destroy() {
		for (const block of blocks) {
			const component = map.get(block);
			if (component) unmount(component);
			map.delete(block);
		}
	}

	// Page changed. Update again
	const unsubscribe = page.subscribe(update);

	return {
		update,
		destroy() {
			destroy();
			unsubscribe();
		}
	};
}
