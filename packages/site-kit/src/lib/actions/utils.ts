import { tick } from 'svelte';

export async function fix_position(element: HTMLElement, fn: Function) {
	let scroll_parent: HTMLElement | null = element;

	while ((scroll_parent = scroll_parent.parentElement)) {
		if (/^(scroll|auto)$/.test(getComputedStyle(scroll_parent).overflowY)) {
			break;
		}
	}

	const top = element.getBoundingClientRect().top;
	fn();
	await tick();
	const delta = element.getBoundingClientRect().top - top;

	if (delta !== 0) {
		// whichever element the user interacted with should stay in the same position
		(scroll_parent ?? window).scrollBy(0, delta);
	}
}
