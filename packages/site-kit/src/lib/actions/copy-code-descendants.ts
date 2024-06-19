import { mount, unmount } from 'svelte';
import { page } from '$app/stores';
import DocsCopyCodeButton from '../docs/DocsCopyCodeButton.svelte';
import type { Action } from 'svelte/action';

const map = new WeakMap();

export const copy_code_descendants: Action = (node) => {
	let code_blocks: NodeListOf<Element>;

	function update() {
		code_blocks = node.querySelectorAll('.copy-code-block');

		// Add a button to each code block
		for (const block of code_blocks) {
			const parent_class = block.parentElement?.classList.toString() ?? '';

			// Exclude the ts-block properties and stuff
			if (/ts-block/.test(parent_class)) continue;

			let code = '';
			for (const node of block.querySelector('code')?.childNodes ?? []) {
				if (node.nodeType === Node.ELEMENT_NODE) {
					if (!(node as HTMLElement).classList.contains('deleted')) {
						code += node.textContent;
					}
				} else {
					code += node.textContent;
				}
			}

			if (!code) continue;

			// This is to make sure that snippets with title get the button on their heading area
			const target = /code-block/.test(parent_class) ? block.parentElement : block;
			if (!target) continue;

			map.set(
				block,
				mount(DocsCopyCodeButton, {
					target: target,
					props: {
						code
					}
				})
			);
		}
	}

	function destroy() {
		for (const block of code_blocks) {
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
};
