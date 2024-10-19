import { mount, onMount, unmount } from 'svelte';
import Tooltip from './Tooltip.svelte';

const CLASSNAME = 'highlight';

export function setupDocsHovers() {
	onMount(() => {
		let tooltip: any;
		let hovered: HTMLSpanElement | null = null;
		let timeout: NodeJS.Timeout;

		function clear() {
			if (!tooltip) return;

			unmount(tooltip);
			hovered?.classList.remove(CLASSNAME);
			tooltip = hovered = null;
		}

		function over(event: MouseEvent) {
			if (event.buttons !== 0) return; // probably selecting

			let target = event.target as HTMLSpanElement;

			if (!target.classList?.contains('twoslash-hover')) {
				return;
			}

			clearTimeout(timeout);

			if (target === hovered) return;

			clear();

			const container = target.querySelector('.twoslash-popup-container')!;

			const code = container.querySelector('.twoslash-popup-code pre code');
			if (code && code.children.length === 2) {
				// for reasons I don't really understand, generated types are duplicated.
				// this is the easiest way to fix it
				const [a, b] = code.children;
				if (a.outerHTML === b.outerHTML) {
					b.remove();
				}
			}

			const html = container.innerHTML;

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
					timeout = setTimeout(clear, 0);
					return;
				}

				target = target.parentElement;
			}
		}

		window.addEventListener('mouseover', over);
		window.addEventListener('mouseout', out);

		return () => {
			window.removeEventListener('mouseover', over);
			window.removeEventListener('mouseout', out);
		};
	});
}
