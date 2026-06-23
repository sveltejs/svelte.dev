import { page } from '$app/state';
import { fix_position } from './utils';
import { Persisted } from '../state';

const show_legacy = new Persisted<'open' | 'closed'>('sv:show-legacy', 'open');

export function legacy_details(node: HTMLElement) {
	let unlisten: (() => void) | undefined;

	function update() {
		unlisten?.();

		const details = node.querySelectorAll('details.legacy') as NodeListOf<HTMLDetailsElement>;
		const show = show_legacy.current === 'open';

		/** Whether the toggle was initiated by user action or `element.open = ...` */
		let secondary = false;

		const on_toggle = (e: Event) => {
			if (secondary) return;

			const detail = e.currentTarget as HTMLDetailsElement;

			secondary = true;
			show_legacy.current = detail.open ? 'open' : 'closed';

			fix_position(detail, () => {
				for (const other of details) {
					if (other !== detail) {
						other.open = detail.open;
					}
				}
			});

			queueMicrotask(() => {
				secondary = false;
			});
		};

		for (const detail of details) {
			detail.open = show;
			detail.addEventListener('toggle', on_toggle);
		}

		unlisten = () => {
			for (const detail of details) {
				detail.removeEventListener('toggle', on_toggle);
			}
		};
	}

	// Page changed. Update again
	$effect(() => {
		page;
		update();
	});

	return {
		destroy: () => unlisten?.()
	};
}
