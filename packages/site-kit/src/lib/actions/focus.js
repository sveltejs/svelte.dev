/** @param {HTMLElement} node */
export function focusable_children(node) {
	const nodes = /** @type {HTMLElement[]} */ (
		Array.from(
			node.querySelectorAll(
				'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])'
			)
		)
	);

	const index = nodes.indexOf(/** @type {HTMLElement} */ (document.activeElement));

	/** @param {number} d */
	const update = (d) => {
		let i = index + d;
		i += nodes.length;
		i %= nodes.length;

		nodes[i].focus();
	};

	return {
		/** @param {string} [selector] */
		next: (selector) => {
			const reordered = [...nodes.slice(index + 1), ...nodes.slice(0, index + 1)];

			for (let i = 0; i < reordered.length; i += 1) {
				if (!selector || reordered[i].matches(selector)) {
					reordered[i].focus();
					return;
				}
			}
		},
		/** @param {string} [selector] */
		prev: (selector) => {
			const reordered = [...nodes.slice(index + 1), ...nodes.slice(0, index + 1)];

			for (let i = reordered.length - 2; i >= 0; i -= 1) {
				if (!selector || reordered[i].matches(selector)) {
					reordered[i].focus();
					return;
				}
			}
		},
		update
	};
}

/**
 * @param {HTMLElement} node
 * @param {{ reset_focus?: boolean }} opts
 */
export function trap(node, { reset_focus = true } = {}) {
	const previous = /** @type HTMLElement} */ (document.activeElement);

	/** @param {KeyboardEvent} e */
	const handle_keydown = (e) => {
		if (e.key === 'Tab') {
			e.preventDefault();

			const group = focusable_children(node);
			if (e.shiftKey) {
				group.prev();
			} else {
				group.next();
			}
		}
	};

	node.addEventListener('keydown', handle_keydown);

	return {
		destroy: () => {
			node.removeEventListener('keydown', handle_keydown);
			if (reset_focus) {
				previous?.focus({ preventScroll: true });
			}
		}
	};
}
