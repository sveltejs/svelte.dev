// A minimal in-memory implementation of the subset of `node:fs` that SvelteKit's
// node-side code (manifest generation, sync etc) uses. The same instance is used
// by the sandbox worker as its virtual filesystem

/** @type {Map<string, string | Uint8Array>} */
const files = new Map();

/** @type {Map<string, Set<string>>} */
const directories = new Map([['/', new Set()]]);

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/** @param {string | URL} file */
function normalize(file) {
	if (file instanceof URL) file = file.pathname;
	file = String(file);
	if (file.length > 1 && file.endsWith('/')) file = file.slice(0, -1);
	return file;
}

/** @param {string} file */
function dirname(file) {
	const i = file.lastIndexOf('/');
	return i <= 0 ? '/' : file.slice(0, i);
}

/** @param {string} dir */
function ensure_dir(dir) {
	if (directories.has(dir)) return;
	directories.set(dir, new Set());
	if (dir !== '/') {
		const parent = dirname(dir);
		ensure_dir(parent);
		/** @type {Set<string>} */ (directories.get(parent)).add(
			dir.slice(parent === '/' ? 1 : parent.length + 1)
		);
	}
}

/** @param {string} code @param {string} message */
function error(code, message) {
	const e = /** @type {any} */ (new Error(`${code}: ${message}`));
	e.code = code;
	return e;
}

export const vfs = {
	files,
	directories,

	/**
	 * @param {string} file
	 * @param {string | Uint8Array} contents
	 */
	write(file, contents) {
		file = normalize(file);
		const dir = dirname(file);
		ensure_dir(dir);
		/** @type {Set<string>} */ (directories.get(dir)).add(
			file.slice(dir === '/' ? 1 : dir.length + 1)
		);
		files.set(file, contents);
	},

	/** @param {string} file */
	remove(file) {
		file = normalize(file);

		if (directories.has(file)) {
			for (const child of [.../** @type {Set<string>} */ (directories.get(file))]) {
				vfs.remove(file === '/' ? `/${child}` : `${file}/${child}`);
			}
			directories.delete(file);
		} else if (!files.delete(file)) {
			return;
		}

		const dir = dirname(file);
		directories.get(dir)?.delete(file.slice(dir === '/' ? 1 : dir.length + 1));
	},

	/** @param {string} file */
	read(file) {
		return files.get(normalize(file));
	},

	/** @param {string} file */
	is_file(file) {
		return files.has(normalize(file));
	},

	/** @param {string} file */
	is_dir(file) {
		return directories.has(normalize(file));
	}
};

class Stats {
	/** @param {boolean} is_dir @param {number} size */
	constructor(is_dir, size) {
		this._is_dir = is_dir;
		this.size = size;
		this.mtimeMs = 0;
		this.mtime = new Date(0);
	}
	isDirectory() {
		return this._is_dir;
	}
	isFile() {
		return !this._is_dir;
	}
	isSymbolicLink() {
		return false;
	}
}

/** @param {string} file */
export function existsSync(file) {
	file = normalize(file);
	return files.has(file) || directories.has(file);
}

/**
 * @param {string} file
 * @param {any} [opts]
 */
export function readFileSync(file, opts) {
	const contents = files.get(normalize(file));
	if (contents === undefined) throw error('ENOENT', `no such file or directory, open '${file}'`);

	const encoding = typeof opts === 'string' ? opts : opts?.encoding;

	if (encoding) {
		return typeof contents === 'string' ? contents : decoder.decode(contents);
	}

	return typeof contents === 'string' ? encoder.encode(contents) : contents;
}

/**
 * @param {string} file
 * @param {string | Uint8Array} contents
 */
export function writeFileSync(file, contents) {
	vfs.write(file, contents);
}

/** @param {string} dir */
export function mkdirSync(dir) {
	ensure_dir(normalize(dir));
}

/**
 * @param {string} dir
 * @param {any} [opts]
 */
export function readdirSync(dir, opts) {
	const children = directories.get(normalize(dir));
	if (!children) throw error('ENOENT', `no such file or directory, scandir '${dir}'`);

	const names = [...children].sort();

	if (opts?.withFileTypes) {
		const base = normalize(dir);
		return names.map((name) => {
			const is_dir = directories.has(base === '/' ? `/${name}` : `${base}/${name}`);
			return {
				name,
				isDirectory: () => is_dir,
				isFile: () => !is_dir,
				isSymbolicLink: () => false
			};
		});
	}

	return names;
}

/**
 * @param {string} file
 * @param {{ throwIfNoEntry?: boolean }} [opts]
 */
export function statSync(file, opts) {
	file = normalize(file);
	if (directories.has(file)) return new Stats(true, 0);
	const contents = files.get(file);
	if (contents === undefined) {
		if (opts?.throwIfNoEntry === false) return undefined;
		throw error('ENOENT', `no such file or directory, stat '${file}'`);
	}
	return new Stats(
		false,
		typeof contents === 'string' ? encoder.encode(contents).length : contents.length
	);
}

export const lstatSync = statSync;

/** @param {string} file */
export function realpathSync(file) {
	return normalize(file);
}

realpathSync.native = realpathSync;

/** @param {string} file */
export function unlinkSync(file) {
	vfs.remove(file);
}

/** @param {string} file */
export function rmSync(file) {
	vfs.remove(file);
}

/**
 * @param {string} from
 * @param {string} to
 */
export function copyFileSync(from, to) {
	vfs.write(to, /** @type {any} */ (files.get(normalize(from))));
}

export default {
	existsSync,
	readFileSync,
	writeFileSync,
	mkdirSync,
	readdirSync,
	statSync,
	lstatSync,
	realpathSync,
	unlinkSync,
	rmSync,
	copyFileSync
};
