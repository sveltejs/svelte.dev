import { page } from '$app/stores';
import { fix_position } from './utils';
import { Persisted } from '../state';

const show_legacy = new Persisted<'open' | 'closed'>('sv:show-legacy', 'open');

export function legacy_details(node: HTMLElement) {
	function update() {
		let scroll_parent: HTMLElement | null = node;

		while ((scroll_parent = scroll_parent.parentElement)) {
			if (/^(scroll|auto)$/.test(getComputedStyle(scroll_parent).overflowY)) {
				break;
			}
		}

		const details = node.querySelectorAll('details.legacy') as NodeListOf<HTMLDetailsElement>;
		const show = show_legacy.current === 'open';

		/** Whether the toggle was initiated by user action or `element.open = !element.open` */
		let secondary = false;

		// Add a select to each code block
		for (const detail of details) {
			detail.open = show;

			detail.addEventListener('toggle', (e) => {
				if (secondary) return;
				secondary = true;

				show_legacy.current = detail.open ? 'open' : 'closed';

				fix_position(detail, () => {
					for (const other of details) {
						if (other !== detail) {
							other.open = detail.open;
						}
					}
				});

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
