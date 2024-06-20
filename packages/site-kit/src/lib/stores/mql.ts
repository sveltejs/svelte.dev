import { browser } from '$app/environment';
import { readable } from 'svelte/store';

export function mql(query: string) {
	return readable(browser ? window.matchMedia(query).matches : false, (set) => {
		if (!browser) return set(false);

		const mediaQueryList = window.matchMedia(query);

		const listener = (event: MediaQueryListEvent) => set(event.matches);

		mediaQueryList.addEventListener('change', listener);

		return () => mediaQueryList.removeEventListener('change', listener);
	});
}
