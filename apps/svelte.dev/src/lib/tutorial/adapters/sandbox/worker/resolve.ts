import { vfs } from '../generated/kit-node.js';
import { dirname, join } from './utils.ts';

export type Environment = 'client' | 'server';

const conditions: Record<Environment, Set<string>> = {
	client: new Set(['browser', 'development', 'import', 'module', 'default']),
	server: new Set(['development', 'import', 'module', 'default'])
};

const extensions = ['.js', '.ts', '.mjs', '.svelte', '.json'];

export const aliases: Array<[string, string]> = [
	['$app', '/node_modules/@sveltejs/kit/src/runtime/app'],
	['$env', '/node_modules/@sveltejs/kit/src/runtime/env'],
	['<sveltekit:generated>', '/.svelte-kit/generated/dev']
];

/** Modules that are replaced wholesale inside the sandbox */
export const virtual: Record<string, string> = {
	vite: '/@sandbox/vite.js',
	'@sveltejs/kit/vite': '/@sandbox/kit-vite.js'
};

export class ResolveError extends Error {}

/**
 * Resolves `specifier` (imported from `importer`) to a path in the virtual filesystem,
 * preserving any query string
 */
export function resolve(specifier: string, importer: string, env: Environment): string {
	let query = '';
	const q = specifier.indexOf('?');
	if (q !== -1) {
		query = specifier.slice(q);
		specifier = specifier.slice(0, q);
	}

	const resolved = resolve_path(specifier, importer, env);

	if (!resolved) {
		throw new ResolveError(`Could not resolve "${specifier}" from ${importer}`);
	}

	return resolved + query;
}

function resolve_path(specifier: string, importer: string, env: Environment): string | null {
	if (specifier in virtual) return virtual[specifier];

	if (specifier.startsWith('/@fs/')) specifier = specifier.slice(4);

	for (const [alias, replacement] of aliases) {
		if (specifier === alias || specifier.startsWith(alias + '/')) {
			return resolve_file(replacement + specifier.slice(alias.length));
		}
	}

	if (specifier.startsWith('/')) {
		return resolve_file(specifier);
	}

	if (specifier.startsWith('./') || specifier.startsWith('../') || specifier === '.') {
		return resolve_file(join(dirname(importer), specifier));
	}

	if (specifier.startsWith('#')) {
		const pkg = find_package_json(importer);
		if (!pkg) return null;

		const { dir, json } = pkg;
		if (!json.imports) return null;

		const target = resolve_map(json.imports, specifier, env);
		if (!target) return null;

		// imports can map to bare specifiers
		if (!target.startsWith('./')) return resolve_path(target, importer, env);

		return resolve_file(join(dir, target));
	}

	// bare import
	const parts = specifier.split('/');
	const name = specifier.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
	const subpath = '.' + specifier.slice(name.length);

	const dir = `/node_modules/${name}`;
	const json = read_json(`${dir}/package.json`);
	if (!json) return null;

	if (json.exports) {
		const target = resolve_map(normalize_exports(json.exports), subpath, env);
		return target ? resolve_file(join(dir, target)) : null;
	}

	if (subpath === '.') {
		const main =
			(env === 'client' && typeof json.browser === 'string' && json.browser) ||
			json.module ||
			json.main ||
			'index.js';
		return resolve_file(join(dir, main));
	}

	return resolve_file(join(dir, subpath));
}

function normalize_exports(exports: any) {
	if (typeof exports === 'string' || Array.isArray(exports)) return { '.': exports };

	const keys = Object.keys(exports);
	if (keys.length > 0 && !keys[0].startsWith('.')) return { '.': exports };

	return exports;
}

function resolve_map(map: Record<string, any>, subpath: string, env: Environment): string | null {
	if (subpath in map) return resolve_conditions(map[subpath], env, '');

	// pattern matching, e.g. `"#lib/*": "./src/lib/*"`
	let best: string | null = null;

	for (const key of Object.keys(map)) {
		const star = key.indexOf('*');
		if (star === -1) continue;

		const prefix = key.slice(0, star);
		const suffix = key.slice(star + 1);

		if (
			subpath.startsWith(prefix) &&
			subpath.endsWith(suffix) &&
			subpath.length >= key.length - 1
		) {
			if (!best || key.length > best.length) best = key;
		}
	}

	if (best) {
		const star = best.indexOf('*');
		const match = subpath.slice(star, subpath.length - (best.length - star - 1));
		return resolve_conditions(map[best], env, match);
	}

	return null;
}

function resolve_conditions(target: any, env: Environment, match: string): string | null {
	if (target === null) return null;

	if (typeof target === 'string') return target.replaceAll('*', match);

	if (Array.isArray(target)) {
		for (const t of target) {
			const resolved = resolve_conditions(t, env, match);
			if (resolved) return resolved;
		}
		return null;
	}

	for (const key of Object.keys(target)) {
		if (conditions[env].has(key)) {
			const resolved = resolve_conditions(target[key], env, match);
			if (resolved) return resolved;
		}
	}

	return null;
}

function resolve_file(file: string): string | null {
	if (vfs.is_file(file)) return file;

	for (const ext of extensions) {
		if (vfs.is_file(file + ext)) return file + ext;
	}

	if (vfs.is_dir(file)) {
		const json = read_json(`${file}/package.json`);
		if (json?.main) {
			const main = resolve_file(join(file, json.main));
			if (main) return main;
		}

		for (const ext of extensions) {
			if (vfs.is_file(`${file}/index${ext}`)) return `${file}/index${ext}`;
		}
	}

	return null;
}

const json_cache = new Map<string, any>();

export function clear_json_cache() {
	json_cache.clear();
}

function read_json(file: string) {
	const contents = vfs.read(file);
	if (contents === undefined) return null;

	const cached = json_cache.get(file);
	if (cached && cached.contents === contents) return cached.json;

	try {
		const json = JSON.parse(
			typeof contents === 'string' ? contents : new TextDecoder().decode(contents)
		);
		json_cache.set(file, { contents, json });
		return json;
	} catch {
		return null;
	}
}

function find_package_json(file: string) {
	let dir = dirname(file);

	while (true) {
		const json = read_json(`${dir === '/' ? '' : dir}/package.json`);
		if (json) return { dir, json };
		if (dir === '/') return null;
		dir = dirname(dir);
	}
}
