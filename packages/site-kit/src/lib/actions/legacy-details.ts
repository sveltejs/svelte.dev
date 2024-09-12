import { page } from '$app/stores';
import { persisted } from 'svelte-persisted-store';
import { get } from 'svelte/store';

const show_legacy = persisted('svelte:show-legacy', true);

export function legacy_details(node: HTMLElement) {
	let details: NodeListOf<HTMLDetailsElement>;

	function update() {
		details = node.querySelectorAll('details.legacy');
		const show = get(show_legacy);

		// Add a select to each code block
		for (const detail of details) {
			detail.open = show;

			detail.addEventListener('toggle', () => {
				show_legacy.set(detail.open);

				for (const other of details) {
					if (other !== detail) {
						other.open = detail.open;
					}
				}
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
