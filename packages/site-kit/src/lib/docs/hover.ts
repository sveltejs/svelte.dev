import { mount, onMount, unmount } from 'svelte';
import Tooltip from './Tooltip.svelte';

const CLASSNAME = 'highlight';
const CLOSE_DELAY = 300;

export function setupDocsHovers() {
	onMount(() => {
		let tooltip: any;
		let hovered: HTMLSpanElement | null = null;
		let timeout: ReturnType<typeof setTimeout> | undefined;

		function cancel_clear() {
			clearTimeout(timeout);
			timeout = undefined;
		}

		function clear() {
			cancel_clear();
			if (!tooltip) return;

			unmount(tooltip);
			hovered?.classList.remove(CLASSNAME);
			tooltip = hovered = null;
		}

		function schedule_clear() {
			cancel_clear();
			timeout = setTimeout(clear, CLOSE_DELAY);
		}

		function over(event: MouseEvent) {
			if (event.buttons !== 0) return; // probably selecting

			const target = (event.target as Element).closest<HTMLSpanElement>('.twoslash-hover');

			if (!target) return;

			cancel_clear();

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
						onmouseenter: cancel_clear,
						onmouseleave: schedule_clear
					}
				});

				hovered = target;
				hovered.classList.add(CLASSNAME);
			}
		}

		function out(event: MouseEvent) {
			if (!hovered || !(event.target instanceof Node) || !hovered.contains(event.target)) return;
			if (event.relatedTarget instanceof Node && hovered.contains(event.relatedTarget)) return;

			schedule_clear();
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
