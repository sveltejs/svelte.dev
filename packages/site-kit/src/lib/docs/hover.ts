import { mount, onMount, unmount } from 'svelte';
import Tooltip from './Tooltip.svelte';

const CLASSNAME = 'highlight';

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
						y,
						source_width: rect.width,
						source_height: rect.height,
						onmouseleave: (event: MouseEvent) => {
							if (event.relatedTarget instanceof Node && hovered?.contains(event.relatedTarget))
								return;
							clear();
						}
					}
				});

				hovered = target;
				hovered.classList.add(CLASSNAME);
			}
		}

		function out(event: MouseEvent) {
			if (!hovered || !(event.target instanceof Node) || !hovered.contains(event.target)) return;
			if (event.relatedTarget instanceof Node && hovered.contains(event.relatedTarget)) return;

			if (
				event.relatedTarget instanceof Element &&
				event.relatedTarget.closest('.tooltip-container')
			)
				return;

			clear();
		}

		window.addEventListener('mouseover', over);
		window.addEventListener('mouseout', out);

		return () => {
			window.removeEventListener('mouseover', over);
			window.removeEventListener('mouseout', out);
			clear();
		};
	});
}
