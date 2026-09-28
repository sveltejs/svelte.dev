export function dirname(path: string) {
	const i = path.lastIndexOf('/');
	return i <= 0 ? '/' : path.slice(0, i);
}

export function join(...parts: string[]) {
	const segments: string[] = [];

	for (const part of parts.join('/').split('/')) {
		if (part === '' || part === '.') continue;
		if (part === '..') segments.pop();
		else segments.push(part);
	}

	return '/' + segments.join('/');
}

export function extname(path: string) {
	const base = path.slice(path.lastIndexOf('/') + 1);
	const i = base.lastIndexOf('.');
	return i <= 0 ? '' : base.slice(i);
}

export function split_query(id: string): [string, URLSearchParams] {
	const i = id.indexOf('?');
	if (i === -1) return [id, new URLSearchParams()];
	return [id.slice(0, i), new URLSearchParams(id.slice(i + 1))];
}

const mime_types: Record<string, string> = {
	'.html': 'text/html',
	'.js': 'text/javascript',
	'.mjs': 'text/javascript',
	'.css': 'text/css',
	'.json': 'application/json',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.gif': 'image/gif',
	'.webp': 'image/webp',
	'.avif': 'image/avif',
	'.ico': 'image/x-icon',
	'.txt': 'text/plain',
	'.woff': 'font/woff',
	'.woff2': 'font/woff2',
	'.mp3': 'audio/mpeg',
	'.mp4': 'video/mp4',
	'.webm': 'video/webm',
	'.svelte': 'text/plain',
	'.md': 'text/markdown'
};

export function get_mime_type(path: string) {
	return mime_types[extname(path)] ?? 'application/octet-stream';
}

export function to_bytes(contents: string | Uint8Array) {
	return typeof contents === 'string' ? new TextEncoder().encode(contents) : contents;
}

export function to_text(contents: string | Uint8Array) {
	return typeof contents === 'string' ? contents : new TextDecoder().decode(contents);
}
