import { browser } from '$app/environment';

export function root_scroll(_: HTMLElement, callback: (e: Event) => void = () => {}) {
	const root_el = document.querySelector('main#main') as HTMLElement;

	root_el?.addEventListener('scroll', callback);

	return {
		destroy() {
			root_el?.removeEventListener('scroll', callback);
		}
	};
}

export const root_scroll_element = browser ? document.querySelector('main#main') : null;
