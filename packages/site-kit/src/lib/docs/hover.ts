import { beforeNavigate } from '$app/navigation';
import { mount, onMount, unmount } from 'svelte';
import Tooltip from './Tooltip.svelte';

const CLASSNAME = 'highlight';

export function setupDocsHovers() {
	let tooltip: any;
	let hovered: HTMLSpanElement | null = null;
	let timeout: NodeJS.Timeout;

	function clear() {
		clearTimeout(timeout);
		if (!tooltip) return;

		unmount(tooltip);
		hovered?.classList.remove(CLASSNAME);
		tooltip = hovered = null;
	}

	beforeNavigate(clear);

	onMount(() => {
		function activate(event: MouseEvent) {
			if ((event.target as Element).closest('a[href]')) clear();
		}

		function over(event: MouseEvent) {
			if (event.buttons !== 0) return; // probably selecting

			const target = (event.target as Element).closest<HTMLSpanElement>('.twoslash-hover');

			if (!target) return;

			clearTimeout(timeout);

			if (target === hovered) return;

			clear();

			const container = target.querySelector('.twoslash-popover');
			const html = container?.innerHTML;

			if (html) {
				const rect = target.getBoundingClientRect();
				const x = (rect.left + rect.right) / 2 + window.scrollX;
				const y = rect.top + window.scrollY;

				tooltip = mount(Tooltip, {
					target: document.body,
					props: {
						html,
						x,
						y,
						onmouseenter: () => {
							clearTimeout(timeout);
						},
						onmouseleave: () => {
							clearTimeout(timeout);
							timeout = setTimeout(clear, 0);
						}
					}
				});

				hovered = target;
				hovered.classList.add(CLASSNAME);
			}
		}

		function out(event: MouseEvent) {
			let target = event.target as HTMLElement | null;

			while (target) {
				if (target.classList.contains('twoslash-hover')) {
					clearTimeout(timeout);
					timeout = setTimeout(clear, 0);
					return;
				}

				target = target.parentElement;
			}
		}

		window.addEventListener('mouseover', over);
		window.addEventListener('mouseout', out);
		window.addEventListener('click', activate);
		window.addEventListener('auxclick', activate);

		return () => {
			window.removeEventListener('mouseover', over);
			window.removeEventListener('mouseout', out);
			window.removeEventListener('click', activate);
			window.removeEventListener('auxclick', activate);
			clear();
		};
	});
}
