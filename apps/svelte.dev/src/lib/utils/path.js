/** @param {string} name */
export function get_depth(name) {
	return name.split('/').length - 1;
}

/** @param {string} path */
export function posixify(path) {
	return path.replace(/\\/g, '/');
}
