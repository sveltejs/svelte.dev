/**
 * Dispatch event on click outside of node
 */
export function focus_outside(node: HTMLElement, callback: () => void) {
	function handler(e: FocusEvent) {
		if (!node?.contains(/** @type {HTMLElement} */ e.target as HTMLElement)) callback();
	}

	document.addEventListener('focus', handler, true);

	return {
		destroy() {
			document.removeEventListener('focus', handler, true);
		}
	};
}
