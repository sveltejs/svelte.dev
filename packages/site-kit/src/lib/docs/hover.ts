import { beforeNavigate } from '$app/navigation';
import { mount, onMount, unmount } from 'svelte';
import Tooltip from './Tooltip.svelte';

const CLASSNAME = 'highlight';

export function setupDocsHovers() {
	let tooltip: any;
	let hovered: HTMLSpanElement | null = null;
	let dismissed: HTMLSpanElement | null = null; // token whose tooltip was closed with Escape
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

		// hide after a tick, unless the pointer moves onto the tooltip/token
		// or focus is still inside the token in the meantime
		function hide() {
			clearTimeout(timeout);
			timeout = setTimeout(() => {
				if (!hovered?.contains(document.activeElement)) clear();
			}, 0);
		}

		function show(target: HTMLSpanElement | null) {
			if (target !== dismissed) dismissed = null;
			if (!target || target === dismissed) return;

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
						onmouseleave: hide
					}
				});

				hovered = target;
				hovered.classList.add(CLASSNAME);
			}
		}

		function get_token(target: EventTarget | null) {
			return target instanceof Element ? target.closest<HTMLSpanElement>('.twoslash-hover') : null;
		}

		function over(event: MouseEvent) {
			if (event.buttons !== 0) return; // probably selecting

			show(get_token(event.target));
		}

		function out(event: MouseEvent) {
			let target = event.target as HTMLElement | null;

			while (target) {
				if (target.classList.contains('twoslash-hover')) {
					hide();
					return;
				}

				target = target.parentElement;
			}
		}

		function focusin(event: FocusEvent) {
			show(get_token(event.target));
		}

		function focusout(event: FocusEvent) {
			const token = get_token(event.target);

			// ignore focus moving between elements inside the same token
			if (token && token !== get_token(event.relatedTarget)) {
				hide();
			}
		}

		function keydown(event: KeyboardEvent) {
			if (event.key === 'Escape' && tooltip) {
				dismissed = hovered;
				clear();
			}
		}

		window.addEventListener('mouseover', over);
		window.addEventListener('mouseout', out);
		window.addEventListener('click', activate);
		window.addEventListener('auxclick', activate);
		window.addEventListener('focusin', focusin);
		window.addEventListener('focusout', focusout);
		window.addEventListener('keydown', keydown);

		return () => {
			window.removeEventListener('mouseover', over);
			window.removeEventListener('mouseout', out);
			window.removeEventListener('click', activate);
			window.removeEventListener('auxclick', activate);
			window.removeEventListener('focusin', focusin);
			window.removeEventListener('focusout', focusout);
			window.removeEventListener('keydown', keydown);
			clear();
		};
	});
}
