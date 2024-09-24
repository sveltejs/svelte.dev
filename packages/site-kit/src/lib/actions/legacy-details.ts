import { page } from '$app/stores';
import { persisted } from 'svelte-persisted-store';
import { get } from 'svelte/store';

const show_legacy = persisted('svelte:show-legacy', true);

export function legacy_details(node: HTMLElement) {
	function update() {
		let scroll_parent: HTMLElement | null = node;

		while ((scroll_parent = scroll_parent.parentElement)) {
			if (/^(scroll|auto)$/.test(getComputedStyle(scroll_parent).overflowY)) {
				break;
			}
		}

		const details = node.querySelectorAll('details.legacy') as NodeListOf<HTMLDetailsElement>;
		const show = get(show_legacy);

		/** Whether the toggle was initiated by user action or `element.open = !element.open` */
		let secondary = false;

		// Add a select to each code block
		for (const detail of details) {
			detail.open = show;

			detail.addEventListener('toggle', (e) => {
				if (secondary) return;
				secondary = true;

				show_legacy.set(detail.open);

				const top = detail.getBoundingClientRect().top;

				for (const other of details) {
					if (other !== detail) {
						other.open = detail.open;
					}
				}

				const delta = detail.getBoundingClientRect().top - top;

				if (delta !== 0) {
					// whichever element the user interacted with should stay in the same position
					(scroll_parent ?? document.body).scrollBy(0, delta);
				}

				setTimeout(() => {
					secondary = false;
				});
			});
		}
	}

	// Page changed. Update again
	const unsubscribe = page.subscribe(update);

	return {
		destroy() {
			unsubscribe();
		}
	};
}
