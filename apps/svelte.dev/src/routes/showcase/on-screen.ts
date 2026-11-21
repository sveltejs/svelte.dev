import type { Attachment } from 'svelte/attachments';

/** calls back each time how much of an element is on screen crosses a threshold */
export function on_screen(
	callback: (entry: IntersectionObserverEntry) => void,
	options?: IntersectionObserverInit
): Attachment<HTMLElement> {
	return (node) => {
		const observer = new IntersectionObserver((entries) => entries.forEach(callback), options);
		observer.observe(node);
		return () => observer.disconnect();
	};
}
