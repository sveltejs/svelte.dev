export function keyEvent(code: number) {
	return function (node: HTMLInputElement, callback: (event: KeyboardEvent) => void) {
		node.addEventListener('keydown', handleKeydown);

		/** @param {KeyboardEvent} event */
		function handleKeydown(event: KeyboardEvent) {
			if (event.keyCode === code) {
				callback.call(node, event);
			}
		}

		return {
			destroy() {
				node.removeEventListener('keydown', handleKeydown);
			}
		};
	};
}

export const enter = keyEvent(13);
