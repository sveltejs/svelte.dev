import { mount, onMount, unmount } from 'svelte';
import Tooltip from './Tooltip.svelte';

const CLASSNAME = 'highlight';
const HOVER_PADDING = 12;

export function setupDocsHovers() {
	onMount(() => {
		let tooltip: any;
		let hovered: HTMLSpanElement | null = null;

		function clear() {
			if (!tooltip) return;

			unmount(tooltip);
			hovered?.classList.remove(CLASSNAME);
			tooltip = hovered = null;
		}

		function over(event: MouseEvent) {
			if (event.buttons !== 0) return; // probably selecting

			const target = (event.target as Element).closest<HTMLSpanElement>('.twoslash-hover');

			if (!target) return;

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
						y
					}
				});

				hovered = target;
				hovered.classList.add(CLASSNAME);
			}
		}

		function move(event: MouseEvent) {
			if (!hovered) return;

			const source = hovered.getBoundingClientRect();
			const panel = tooltip.get_rect();
			if (!panel) return;

			// Check coordinates rather than covering nearby tokens with a transparent element.
			if (
				event.clientX < Math.min(source.left, panel.left) - HOVER_PADDING ||
				event.clientX > Math.max(source.right, panel.right) + HOVER_PADDING ||
				event.clientY < Math.min(source.top, panel.top) - HOVER_PADDING ||
				event.clientY > Math.max(source.bottom, panel.bottom) + HOVER_PADDING
			) {
				clear();
			}
		}

		function out(event: MouseEvent) {
			if (!event.relatedTarget) clear();
		}

		window.addEventListener('mouseover', over);
		window.addEventListener('mousemove', move);
		window.addEventListener('mouseout', out);

		return () => {
			window.removeEventListener('mouseover', over);
			window.removeEventListener('mousemove', move);
			window.removeEventListener('mouseout', out);
			clear();
		};
	});
}
