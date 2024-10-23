import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export const should_nav_autohide = writable(false);
export const nav_open = writable(false);

// Secondarily related to bav
export const overlay_open = writable(false);
export const on_this_page_open = writable(false);

overlay_open.subscribe((value) => {
	if (!browser) return;

	if (value) {
		// Disable root from scrolling
		document.documentElement.style.overflow = 'hidden';
		document.documentElement.style.scrollbarGutter = 'stable';
	} else {
		// Enable root to scroll
		document.documentElement.style.overflow = '';
		document.documentElement.style.scrollbarGutter = '';
	}
});
