// shims for `node:process`, `node:url`, `node:util` and friends

export const process = {
	cwd: () => '/',
	env: {},
	platform: 'browser',
	versions: {},
	argv: [],
	exit() {},
	on() {}
};

/** @param {string | URL} url */
export function fileURLToPath(url) {
	return decodeURIComponent(new URL(url).pathname);
}

/** @param {string} path */
export function pathToFileURL(path) {
	return new URL(`file://${path}`);
}

export const URL = globalThis.URL;

/**
 * @param {string | string[]} _format
 * @param {string} text
 */
export function styleText(_format, text) {
	return text;
}

export class AsyncLocalStorage {
	/** @type {any} */
	#store;

	getStore() {
		return this.#store;
	}

	/**
	 * @param {any} store
	 * @param {Function} fn
	 * @param {any[]} args
	 */
	run(store, fn, ...args) {
		const previous = this.#store;
		this.#store = store;
		try {
			return fn(...args);
		} finally {
			this.#store = previous;
		}
	}
}

/** @param {string} name */
export function unsupported(name) {
	return () => {
		throw new Error(`${name} is not supported in the sandbox`);
	};
}

export default { process, fileURLToPath, pathToFileURL, URL, styleText, AsyncLocalStorage };
