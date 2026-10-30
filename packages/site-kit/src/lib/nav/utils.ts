/**
 * Determines whether a navigation item should be highlighted for the given pathname.
 * If `match` is provided, it takes precedence over the default behaviour of
 * matching `path` and any path beneath it. `false` means never highlight.
 */
export function is_active(pathname: string, path: string, match?: RegExp | false) {
	if (match === false) return false;
	if (match) return match.test(pathname);
	return pathname === path || pathname.startsWith(path.endsWith('/') ? path : path + '/');
}
