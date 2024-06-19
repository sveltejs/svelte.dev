import { mount, onMount, unmount } from 'svelte';
import Tooltip from './Tooltip.svelte';

export function setupDocsHovers() {
	onMount(() => {
		let tooltip: any;
		let timeout: NodeJS.Timeout;

		function over(event: MouseEvent) {
			const target = event.target as HTMLElement;

			if (target.tagName === 'DATA-LSP') {
				clearTimeout(timeout);

				if (tooltip) {
					unmount(tooltip);
					tooltip = null;
				}

				const rect = target?.getBoundingClientRect();
				const html = target?.getAttribute('lsp');

				const x = (rect.left + rect.right) / 2 + window.scrollX;
				const y = rect.top + window.scrollY;

				if (html) {
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
								unmount(tooltip);
								tooltip = null;
							}
						}
					});
				}
			}
		}

		function out(event: MouseEvent) {
			const target = event.target as HTMLElement;
			if (target.tagName === 'DATA-LSP') {
				timeout = setTimeout(() => {
					unmount(tooltip);
					tooltip = null;
				}, 200);
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
