import '../patch_window';
import { sleep } from '../../utils';
import { rollup } from '@rollup/browser';
import { DEV } from 'esm-env';
import * as resolve from 'resolve.exports';
import commonjs from './plugins/commonjs';
import glsl from './plugins/glsl';
import json from './plugins/json';
import mp3 from './plugins/mp3';
import image from './plugins/image';
import svg from './plugins/svg';
import replace from './plugins/replace';
import loop_protect from './plugins/loop-protect';
import type { Plugin, TransformResult } from '@rollup/browser';
import type { BundleMessageData } from '../workers';
import type { File, Warning } from '../../types';
import type { CompileError, CompileResult } from 'svelte/compiler';

let packages_url: string;
let svelte_url: string;
let current_id: number;

let fulfil_ready: (arg?: never) => void;
const ready = new Promise((f) => {
	fulfil_ready = f;
});

self.addEventListener('message', async (event: MessageEvent<BundleMessageData>) => {
	switch (event.data.type) {
		case 'init': {
			({ packages_url, svelte_url } = event.data);

			const { version } = await fetch(`${svelte_url}/package.json`).then((r) => r.json());
			console.log(`Using Svelte compiler version ${version}`);

			const compiler = await fetch(`${svelte_url}/compiler/index.js`).then((r) => r.text());
			(0, eval)(compiler + '\n//# sourceURL=compiler/index.js@' + version);

			fulfil_ready();
			break;
		}

		case 'bundle': {
			await ready;
			const { uid, files } = event.data;

			if (files.length === 0) return;

			current_id = uid;

			setTimeout(async () => {
				if (current_id !== uid) return;

				const result = await bundle({ uid, files });

				if (JSON.stringify(result.error) === JSON.stringify(ABORT)) return;
				if (result && uid === current_id) postMessage(result);
			});

			break;
		}
	}
});

let cached: Record<
	'client' | 'server',
	Map<string, { code: string; result: ReturnType<typeof svelte.compile> }>
> = {
	client: new Map(),
	server: new Map()
};

const ABORT = { aborted: true };

const FETCH_CACHE: Map<string, Promise<{ url: string; body: string }>> = new Map();

async function fetch_if_uncached(url: string, uid: number) {
	if (FETCH_CACHE.has(url)) {
		return FETCH_CACHE.get(url);
	}

	// TODO: investigate whether this is necessary
	await sleep(50);
	if (uid !== current_id) throw ABORT;

	const promise = fetch(url)
		.then(async (r) => {
			if (!r.ok) throw new Error(await r.text());

			return {
				url: r.url,
				body: await r.text()
			};
		})
		.catch((err) => {
			FETCH_CACHE.delete(url);
			throw err;
		});

	FETCH_CACHE.set(url, promise);
	return promise;
}

async function follow_redirects(url: string, uid: number) {
	const res = await fetch_if_uncached(url, uid);
	return res?.url;
}

function compare_to_version(major: number, minor: number, patch: number): number {
	const v = svelte.VERSION.match(/^(\d+)\.(\d+)\.(\d+)/);

	// @ts-ignore
	return +v[1] - major || +v[2] - minor || +v[3] - patch;
}

function is_v4() {
	return compare_to_version(4, 0, 0) >= 0;
}

function is_v5() {
	return compare_to_version(5, 0, 0) >= 0;
}

function is_legacy_package_structure() {
	return compare_to_version(3, 4, 4) <= 0;
}

function has_loopGuardTimeout_feature() {
	return compare_to_version(3, 14, 0) >= 0;
}

async function resolve_from_pkg(
	pkg: Record<string, unknown>,
	subpath: string,
	uid: number,
	pkg_url_base: string
) {
	// match legacy Rollup logic — pkg.svelte takes priority over pkg.exports
	if (typeof pkg.svelte === 'string' && subpath === '.') {
		return pkg.svelte;
	}

	// modern
	if (pkg.exports) {
		try {
			const resolved = resolve.exports(pkg, subpath, {
				browser: true,
				conditions: ['svelte', 'development']
			});

			return resolved?.[0];
		} catch {
			throw `no matched export path was found in "${pkg.name}/package.json"`;
		}
	}

	// legacy
	if (subpath === '.') {
		let resolved_id = resolve.legacy(pkg, {
			fields: ['browser', 'module', 'main']
		});

		if (typeof resolved_id === 'object' && !Array.isArray(resolved_id)) {
			const subpath = resolved_id['.'];
			if (subpath === false) return 'data:text/javascript,export {}';

			resolved_id =
				subpath ??
				resolve.legacy(pkg, {
					fields: ['module', 'main']
				});
		}

		if (!resolved_id) {
			// last ditch — try to match index.js/index.mjs
			for (const index_file of ['index.mjs', 'index.js']) {
				try {
					const indexUrl = new URL(index_file, `${pkg_url_base}/`).href;
					return (await follow_redirects(indexUrl, uid)) ?? '';
				} catch {
					// maybe the next option will be successful
				}
			}

			throw `could not find entry point in "${pkg.name}/package.json"`;
		}

		return resolved_id;
	}

	if (typeof pkg.browser === 'object') {
		// this will either return `pkg.browser[subpath]` or `subpath`
		return resolve.legacy(pkg, {
			browser: subpath
		});
	}

	return subpath;
}

async function get_bundle(
	uid: number,
	mode: 'client' | 'server',
	cache: (typeof cached)['client'],
	local_files_lookup: Map<string, File>
) {
	let bundle;

	/** A set of package names (without subpaths) to include in pkg.devDependencies when downloading an app */
	const imports: Set<string> = new Set();
	const warnings: Warning[] = [];
	const all_warnings: Array<{ message: string }> = [];
	const new_cache: typeof cache = new Map();

	const repl_plugin: Plugin = {
		name: 'svelte-repl',
		async resolveId(importee, importer) {
			if (uid !== current_id) throw ABORT;

			if (importee === 'esm-env') return importee;

			const v5 = is_v5();
			const v4 = !v5 && is_v4();

			if (!v5) {
				// importing from Svelte
				if (importee === `svelte`)
					return v4 ? `${svelte_url}/src/runtime/index.js` : `${svelte_url}/index.mjs`;

				if (importee.startsWith(`svelte/`)) {
					const sub_path = importee.slice(7);
					if (v4) {
						return `${svelte_url}/src/runtime/${sub_path}/index.js`;
					}

					return is_legacy_package_structure()
						? `${svelte_url}/${sub_path}.mjs`
						: `${svelte_url}/${sub_path}/index.mjs`;
				}
			}

			// importing from another file in REPL
			if (local_files_lookup.has(importee) && (!importer || local_files_lookup.has(importer)))
				return importee;
			if (local_files_lookup.has(importee + '.js')) return importee + '.js';
			if (local_files_lookup.has(importee + '.json')) return importee + '.json';

			// remove trailing slash
			if (importee.endsWith('/')) importee = importee.slice(0, -1);

			// importing from a URL
			if (/^https?:/.test(importee)) return importee;

			if (importee.startsWith('.')) {
				if (importer && local_files_lookup.has(importer)) {
					// relative import in a REPL file
					// should've matched above otherwise importee doesn't exist
					console.error(`Cannot find file "${importee}" imported by "${importer}" in the REPL`);
					return;
				} else {
					// relative import in an external file
					const url = new URL(importee, importer).href;
					self.postMessage({ type: 'status', uid, message: `resolving ${url}` });

					return await follow_redirects(url, uid);
				}
			} else {
				// fetch from unpkg
				self.postMessage({ type: 'status', uid, message: `resolving ${importee}` });

				const match = /^((?:@[^/]+\/)?[^/]+)(\/.+)?$/.exec(importee);
				if (!match) {
					return console.error(`Invalid import "${importee}"`);
				}

				const pkg_name = match[1];
				const subpath = `.${match[2] ?? ''}`;

				// if this was imported by one of our files, add it to the `imports` set
				if (importer && local_files_lookup.has(importer)) {
					imports.add(pkg_name);
				}

				const fetch_package_info = async () => {
					try {
						const version = pkg_name === 'svelte' ? svelte.VERSION : 'latest';
						const pkg_url = await follow_redirects(
							`${packages_url}/${pkg_name}@${version}/package.json`,
							uid
						);

						if (!pkg_url) throw new Error();

						const pkg_json = (await fetch_if_uncached(pkg_url, uid))?.body;
						const pkg = JSON.parse(pkg_json ?? '""');

						const pkg_url_base = pkg_url.replace(/\/package\.json$/, '');

						return {
							pkg,
							pkg_url_base
						};
					} catch (_e) {
						throw new Error(`Error fetching "${pkg_name}" from unpkg. Does the package exist?`);
					}
				};

				const { pkg, pkg_url_base } = await fetch_package_info();

				try {
					const resolved_id = await resolve_from_pkg(pkg, subpath, uid, pkg_url_base);
					return new URL(resolved_id + '', `${pkg_url_base}/`).href;
				} catch (reason) {
					throw new Error(`Cannot import "${importee}": ${reason}.`);
				}
			}
		},
		async load(resolved) {
			if (uid !== current_id) throw ABORT;

			if (resolved === 'esm-env') {
				return `export const BROWSER = true; export const DEV = true`;
			}

			const cached_file = local_files_lookup.get(resolved);
			if (cached_file) {
				return cached_file.source;
			}

			if (!FETCH_CACHE.has(resolved)) {
				self.postMessage({ type: 'status', uid, message: `fetching ${resolved}` });
			}

			const res = await fetch_if_uncached(resolved, uid);
			return res?.body;
		},
		transform(code, id) {
			if (uid !== current_id) throw ABORT;

			self.postMessage({ type: 'status', uid, message: `bundling ${id}` });

			if (!/\.(svelte|js)$/.test(id)) return null;

			const name = id.split('/').pop()?.split('.')[0];

			const cached_id = cache.get(id);
			let result: CompileResult;

			if (cached_id && cached_id.code === code) {
				result = cached_id.result;
			} else if (id.endsWith('.svelte')) {
				result = svelte.compile(code, {
					filename: name + '.svelte',
					// @ts-expect-error
					generate: Number(svelte.VERSION.split('.')[0]) >= 5 ? 'client' : 'dom',
					dev: true
				});

				if (result.css) {
					// resolve local files by inlining them
					result.css.code = result.css.code.replace(
						/url\(['"]?(\..+?\.(svg|webp|png))['"]?\)/g,
						(match, $1, $2) => {
							if (local_files_lookup.has($1)) {
								if ($2 === 'svg') {
									return `url('data:image/svg+xml;base64,${btoa(local_files_lookup.get($1)!.source)}')`;
								} else {
									return `url('data:image/${$2};base64,${local_files_lookup.get($1)!.source}')`;
								}
							} else {
								return match;
							}
						}
					);
					// add the CSS via injecting a style tag
					result.js.code +=
						'\n\n' +
						`
					import { styles as $$_styles } from './__shared.js';
					const $$__style = document.createElement('style');
					$$__style.textContent = ${JSON.stringify(result.css.code)};
					document.head.append($$__style);
					$$_styles.push($$__style);
				`.replace(/\t/g, '');
				}
			} else if (id.endsWith('.svelte.js')) {
				result = svelte.compileModule(code, {
					filename: name + '.js',
					generate: 'client',
					dev: true
				});
				if (!result) {
					return null;
				}
			} else {
				return null;
			}

			new_cache.set(id, { code, result });

			// @ts-expect-error
			(result.warnings || result.stats?.warnings)?.forEach((warning) => {
				// This is required, otherwise postMessage won't work
				// @ts-ignore
				delete warning.toString;
				// TODO remove stats post-launch
				// @ts-ignore
				warnings.push(warning);
			});

			const transform_result: TransformResult = {
				code: result.js.code,
				map: result.js.map
			};

			return transform_result;
		}
	};

	try {
		bundle = await rollup({
			input: './__entry.js',
			plugins: [
				repl_plugin,
				commonjs,
				json,
				svg,
				mp3,
				image,
				glsl,
				loop_protect,
				replace({
					'process.env.NODE_ENV': JSON.stringify('production')
				})
			],
			output: {
				inlineDynamicImports: true
			},
			onwarn(warning) {
				all_warnings.push({
					message: warning.message
				});
			}
		});

		return {
			bundle,
			imports: Array.from(imports),
			cache: new_cache,
			error: null,
			warnings,
			all_warnings
		};
	} catch (error) {
		return { error, imports: null, bundle: null, cache: new_cache, warnings, all_warnings };
	}
}

export type BundleResult = ReturnType<typeof bundle>;

async function bundle({ uid, files }: { uid: number; files: File[] }) {
	if (!DEV) {
		console.clear();
		console.log(`running Svelte compiler version %c${svelte.VERSION}`, 'font-weight: bold');
	}

	const lookup: Map<string, File> = new Map();

	lookup.set('./__entry.js', {
		name: '__entry',
		source: `
			import { unmount as u } from 'svelte';
			import { styles } from './__shared.js';
			export { mount, untrack } from 'svelte';
			export {default as App} from './App.svelte';
			export function unmount(component) {
				u(component);
				styles.forEach(style => style.remove());
			}
		`,
		type: 'js',
		modified: false
	});

	lookup.set('./__shared.js', {
		name: '__entry',
		source: `
			export let styles = [];
		`,
		type: 'js',
		modified: false
	});

	files.forEach((file) => {
		const path = `./${file.name}.${file.type}`;
		lookup.set(path, file);
	});

	let client: Awaited<ReturnType<typeof get_bundle>> = await get_bundle(
		uid,
		'client',
		cached.client,
		lookup
	);

	try {
		if (client.error) {
			throw client.error;
		}

		cached.client = client.cache;

		const client_result = (
			await client.bundle?.generate({
				format: 'iife',
				exports: 'named'
				// sourcemap: 'inline'
			})
		)?.output[0];

		const server = false // TODO how can we do SSR?
			? await get_bundle(uid, 'server', cached.server, lookup)
			: null;

		if (server) {
			cached.server = server.cache;
			if (server.error) {
				throw server.error;
			}
		}

		const server_result = server
			? (
					await server.bundle?.generate({
						format: 'iife',
						name: 'SvelteComponent',
						exports: 'named'
						// sourcemap: 'inline'
					})
				)?.output?.[0]
			: null;

		return {
			uid,
			client: client_result,
			server: server_result,
			imports: client.imports,
			// Svelte 5 returns warnings as error objects with a toJSON method, prior versions return a POJO
			warnings: client.warnings.map((w: any) => w.toJSON?.() ?? w),
			error: null
		};
	} catch (err) {
		console.error(err);

		const e = err as CompileError;

		return {
			uid,
			client: null,
			server: null,
			imports: null,
			warnings: client.warnings,
			error: { ...e }
		};
	}
}
