import { page } from '$app/state';
import { fix_position } from './utils';
import { Persisted } from '../state';
import type { Attachment } from 'svelte/attachments';

const show_legacy = new Persisted<'open' | 'closed'>('sv:show-legacy', 'open');

export const legacy_details: Attachment = (node) => {
	// run whenever the pathname changes
	page.url.pathname;

	const details = node.querySelectorAll('details.legacy') as NodeListOf<HTMLDetailsElement>;

	const on_toggle = (e: Event) => {
		const detail = e.currentTarget as HTMLDetailsElement;

		show_legacy.current = detail.open ? 'open' : 'closed';

		fix_position(detail, () => {
			for (const other of details) {
				if (other !== detail) {
					other.open = detail.open;
				}
			}
		});
	};

	for (const detail of details) {
		detail.addEventListener('toggle', on_toggle);
	}

	return () => {
		for (const detail of details) {
			detail.removeEventListener('toggle', on_toggle);
		}
	};
};
