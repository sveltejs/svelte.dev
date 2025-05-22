import * as resolve from 'resolve.exports';
import { parseTar, type FileDescription } from 'tarparser';
import { NPM } from './constants';

export interface Package {
	meta: any; // package.json contents
	contents: Record<string, FileDescription>;
}

/** map of `pkg-name@1` -> `1.2.3` */
const versions = new Map<string, Promise<string>>();
const packages = new Map<string, Promise<Package>>();

const pkg_pr_new_regex = /^(pr|commit|branch)-(.+)/;

export async function load_svelte(version: string, onresolve?: (resolved: string) => void) {
	if (version === 'local') {
		await import(/* @vite-ignore */ `${location.origin}/svelte/compiler/index.js`);
	} else {
		if (!pkg_pr_new_regex.test(version)) {
			version = await resolve_version('svelte', version);
			onresolve?.(version);
		}

		const pkg = await fetch_package('svelte', version);

		const entry = version.startsWith('3.')
			? 'compiler.js'
			: version.startsWith('4.')
				? 'compiler.cjs'
				: 'compiler/index.js';

		const compiler = pkg.contents[entry].text;

		(0, eval)(compiler + `\n//# sourceURL=${entry}@` + version);
	}

	console.log(`Using Svelte compiler version ${version}`);

	let can_use_experimental_async = false;

	try {
		svelte.compileModule('', {
			generate: 'client',
			// @ts-expect-error
			experimental: {
				async: true
			}
		});

		can_use_experimental_async = true;
	} catch (e) {
		// do nothing
	}

	return {
		svelte,
		version,
		can_use_experimental_async
	};
}

export async function resolve_version(name: string, version: string): Promise<string> {
	if (pkg_pr_new_regex.test(version)) {
		return version;
	}

	const key = `${name}@${version}`;

	if (!versions.has(key)) {
		const promise = fetch(
			`https://data.jsdelivr.com/v1/packages/npm/${name}/resolved?specifier=${version}`
		).then(async (r) => {
			if (!r.ok) {
				versions.delete(key);
				throw new Error(`Failed to import ${key}. Are you sure the package exists?`);
			}

			return (await r.json()).version;
		});

		versions.set(key, promise);
	}

	return await versions.get(key)!;
}

export async function fetch_package(name: string, version: string): Promise<Package> {
	const key = `${name}@${version}`;

	if (!packages.has(key)) {
		const match = pkg_pr_new_regex.exec(version);

		const url = match
			? `https://pkg.pr.new/svelte@${match[2]}`
			: `https://registry.npmjs.org/${name}/-/${name.split('/').pop()}-${version}.tgz`;

		const promise = fetch(url).then(async (r) => {
			if (!r.ok) {
				packages.delete(url);
				throw new Error(`Failed to fetch ${url}`);
			}

			const contents: Record<string, FileDescription> = {};

			for (const file of await parseTar(await r.arrayBuffer())) {
				if (file.type === 'file') {
					contents[file.name.slice(8)] = file; // remove `package/` prefix
				}
			}

			const meta = JSON.parse(contents['package.json'].text);

			return { meta, contents };
		});

		packages.set(key, promise);
	}

	return packages.get(key)!;
}

export function resolve_subpath(pkg: Package, subpath: string): string {
	// match legacy Rollup logic — pkg.svelte takes priority over pkg.exports
	if (typeof pkg.meta.svelte === 'string' && subpath === '.') {
		return `./${pkg.meta.svelte.replace('./', '')}`;
	}

	if (subpath[0] === '#') {
		try {
			const resolved = resolve.imports(pkg.meta, subpath, {
				browser: true,
				conditions: ['svelte', 'module', 'browser', 'development']
			});

			return resolved?.[0] as string;
		} catch {
			throw new Error(
				`No matched import path was found for "${subpath}" in "${pkg.meta.name}/package.json"`
			);
		}
	}

	// modern
	if (pkg.meta.exports) {
		try {
			const resolved = resolve.exports(pkg.meta, subpath, {
				browser: true,
				conditions: ['svelte', 'module', 'browser', 'development']
			});

			return resolved?.[0] as string;
		} catch {
			throw new Error(
				`No matched export path was found for "${subpath}" in "${pkg.meta.name}/package.json"`
			);
		}
	}

	// legacy
	if (subpath === '.') {
		let resolved_id = resolve.legacy(pkg.meta, {
			fields: ['browser', 'module', 'main']
		});

		if (typeof resolved_id === 'object' && !Array.isArray(resolved_id)) {
			const subpath = resolved_id['.'];
			if (subpath === false) return 'data:text/javascript,export {}';

			resolved_id =
				subpath ??
				resolve.legacy(pkg.meta, {
					fields: ['module', 'main']
				});
		}

		if (!resolved_id) {
			// last ditch — try to match index.js/index.mjs
			if (pkg.contents['index.mjs']) return './index.mjs';
			if (pkg.contents['index.js']) return './index.js';

			throw new Error(`Could not find entry point in "${pkg.meta.name}/package.json"`);
		}

		return resolved_id as string;
	}

	if (typeof pkg.meta.browser === 'object') {
		// this will either return `pkg.browser[subpath]` or `subpath`
		return resolve.legacy(pkg.meta, {
			browser: subpath
		}) as string;
	}

	return subpath;
}

export function normalize_path(pkg: Package, path: string) {
	for (const suffix of ['', '.js', '.mjs', '.cjs', '/index.js', '/index.mjs', '/index.cjs']) {
		let with_suffix = path + suffix;

		if (pkg.meta.browser) {
			with_suffix = pkg.meta.browser[`./${with_suffix}`]?.replace('./', '') ?? with_suffix;
		}

		const file = pkg.contents[with_suffix];

		if (file && file.type === 'file') {
			return `${NPM}/${pkg.meta.name}@${pkg.meta.version}/${with_suffix}`;
		}
	}

	throw new Error(`Could not find ${path} in ${pkg.meta.name}@${pkg.meta.version}`);
}

const LOCAL_PKG_URL = `${location.origin}/svelte/package.json`;
let local_svelte_pkg: Promise<any>;

export async function resolve_local(specifier: string) {
	const pkg = await (local_svelte_pkg ??= fetch(LOCAL_PKG_URL).then((r) => r.json()));

	const subpath =
		specifier[0] === '#'
			? (resolve.imports(pkg, specifier, {
					browser: true
				})![0] as string)
			: (resolve.exports(pkg, specifier.replace('svelte', '.'), {
					browser: true
				})![0] as string);

	return new URL(subpath, LOCAL_PKG_URL).href;
}

export function parse_npm_url(href: string) {
	const match = /^npm:\/\/\$\/((?:@[^/]+\/)?[^/@]+)(?:@([^/]+))?(\/.+)?$/.exec(href);

	if (!match) {
		throw new Error(`${href} is not a valid npm URL`);
	}

	return {
		name: match[1],
		version: match[2],
		subpath: match[3]
	};
}
