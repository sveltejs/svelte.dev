/**
 * Dispatch event on click outside of node
 */
export function click_outside(node: HTMLElement, callback: () => void) {
	const handler = (e: MouseEvent) => {
		if (!node.contains(e.target as HTMLElement)) callback();
	};

	document.addEventListener('click', handler, true);

	return {
		destroy() {
			document.removeEventListener('click', handler, true);
		}
	};
}
