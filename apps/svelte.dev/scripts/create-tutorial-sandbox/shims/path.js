// minimal posix-only implementation of `node:path`

export const sep = '/';
export const delimiter = ':';

/** @param {string} path */
export function isAbsolute(path) {
	return path.startsWith('/');
}

/** @param {string} path */
export function normalize(path) {
	const absolute = isAbsolute(path);
	const trailing = path.endsWith('/');

	/** @type {string[]} */
	const parts = [];

	for (const part of path.split('/')) {
		if (part === '' || part === '.') continue;
		if (part === '..') {
			if (parts.length > 0 && parts[parts.length - 1] !== '..') parts.pop();
			else if (!absolute) parts.push('..');
		} else {
			parts.push(part);
		}
	}

	let result = parts.join('/');
	if (absolute) result = '/' + result;
	if (trailing && result !== '/' && result !== '') result += '/';

	return result || (absolute ? '/' : '.');
}

/** @param {string[]} parts */
export function join(...parts) {
	const joined = parts.filter((part) => part !== '').join('/');
	return joined ? normalize(joined) : '.';
}

/** @param {string[]} parts */
export function resolve(...parts) {
	let resolved = '';

	for (let i = parts.length - 1; i >= 0; i -= 1) {
		const part = parts[i];
		if (!part) continue;
		resolved = resolved ? `${part}/${resolved}` : part;
		if (isAbsolute(part)) break;
	}

	if (!isAbsolute(resolved)) resolved = `/${resolved}`;

	const normalized = normalize(resolved);
	return normalized.length > 1 && normalized.endsWith('/') ? normalized.slice(0, -1) : normalized;
}

/**
 * @param {string} from
 * @param {string} to
 */
export function relative(from, to) {
	const a = resolve(from).split('/').filter(Boolean);
	const b = resolve(to).split('/').filter(Boolean);

	let i = 0;
	while (i < a.length && i < b.length && a[i] === b[i]) i += 1;

	return [...a.slice(i).map(() => '..'), ...b.slice(i)].join('/');
}

/** @param {string} path */
export function dirname(path) {
	if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
	const i = path.lastIndexOf('/');
	if (i === -1) return '.';
	if (i === 0) return '/';
	return path.slice(0, i);
}

/**
 * @param {string} path
 * @param {string} [ext]
 */
export function basename(path, ext) {
	if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
	let base = path.slice(path.lastIndexOf('/') + 1);
	if (ext && base.endsWith(ext) && base !== ext) base = base.slice(0, -ext.length);
	return base;
}

/** @param {string} path */
export function extname(path) {
	const base = basename(path);
	const i = base.lastIndexOf('.');
	return i <= 0 ? '' : base.slice(i);
}

/** @param {string} path */
export function parse(path) {
	const base = basename(path);
	const ext = extname(path);
	return {
		root: isAbsolute(path) ? '/' : '',
		dir: dirname(path),
		base,
		ext,
		name: ext ? base.slice(0, -ext.length) : base
	};
}

/** @param {{ dir?: string, base?: string, name?: string, ext?: string }} obj */
export function format(obj) {
	const base = obj.base ?? `${obj.name ?? ''}${obj.ext ?? ''}`;
	return obj.dir ? `${obj.dir}/${base}` : base;
}

/** @param {string} path */
export function toNamespacedPath(path) {
	return path;
}

const path = {
	sep,
	delimiter,
	isAbsolute,
	normalize,
	join,
	resolve,
	relative,
	dirname,
	basename,
	extname,
	parse,
	format,
	toNamespacedPath
};

// @ts-expect-error
path.posix = path;
// @ts-expect-error
path.win32 = path;

export const posix = path;
export const win32 = path;

export default path;
