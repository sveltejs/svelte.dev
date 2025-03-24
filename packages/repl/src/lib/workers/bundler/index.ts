import '@sveltejs/site-kit/polyfills';
import * as tailwindcss from 'tailwindcss';
import { walk } from 'zimmerframe';
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
import type { Plugin, RollupCache, TransformResult } from '@rollup/browser';
import type { BundleMessageData, BundleOptions } from '../workers';
import type { Warning } from '../../types';
import type { CompileError, CompileResult } from 'svelte/compiler';
import type { File } from 'editor';
import type { Node } from 'estree';
import { parseTar, type FileDescription } from 'tarparser';
import { max } from './semver';

import tailwind_preflight from 'tailwindcss/preflight.css?raw';
import tailwind_theme from 'tailwindcss/theme.css?raw';
import tailwind_utilities from 'tailwindcss/utilities.css?raw';

// hack for magic-string and rollup inline sourcemaps
// do not put this into a separate module and import it, would be treeshaken in prod
self.window = self;

let packages_url: string;
let svelte_url: string;
let version: string;
let current_id: number;

let inited = Promise.withResolvers<typeof svelte>();

let can_use_experimental_async = false;

async function init(v: string, packages_url: string) {
	const match = /^(pr|commit|branch)-(.+)/.exec(v);

	let tarball: FileDescription[] | undefined;

	if (match) {
		const response = await fetch(`https://pkg.pr.new/svelte@${match[2]}`);

		if (!response.ok) {
			throw new Error(
				`impossible to fetch the compiler from this ${match[1] === 'pr' ? 'PR' : 'commit'}`
			);
		}

		tarball = await parseTar(await response.arrayBuffer());

		const json = tarball.find((file) => file.name === 'package/package.json')!.text;
		version = JSON.parse(json).version;

		svelte_url = `svelte://svelte@${version}`;

		for (const file of tarball) {
			const url = `${svelte_url}/${file.name.slice('package/'.length)}`;
			FETCH_CACHE.set(url, Promise.resolve({ url, body: file.text }));
		}
	} else if (v === 'local') {
		version = v;
		svelte_url = `/svelte`;
	} else {
		const response = await fetch(`${packages_url}/svelte@${v}/package.json`);
		const pkg = await response.json();
		version = pkg.version;
		svelte_url = `${packages_url}/svelte@${version}`;
	}

	console.log(`Using Svelte compiler version ${version}`);

	const entry = version.startsWith('3.')
		? 'compiler.js'
		: version.startsWith('4.')
			? 'compiler.cjs'
			: 'compiler/index.js';

	const compiler = tarball
		? tarball.find((file) => file.name === `package/${entry}`)!.text
		: await fetch(`${svelte_url}/${entry}`).then((r) => r.text());

	(0, eval)(compiler + `\n//# sourceURL=${entry}@` + version);

	try {
		self.svelte.compileModule('', {
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

	return svelte;
}

self.addEventListener('message', async (event: MessageEvent<BundleMessageData>) => {
	switch (event.data.type) {
		case 'init': {
			packages_url = event.data.packages_url;
			init(event.data.svelte_version, packages_url).then(inited.resolve, inited.reject);
			break;
		}

		case 'bundle': {
			try {
				await inited.promise;
			} catch (e) {
				self.postMessage({
					type: 'error',
					uid: event.data.uid,
					message: `Error loading the compiler: ${(e as Error).message}`
				});
			}
			const { uid, files, options } = event.data;

			if (files.length === 0) return;

			current_id = uid;

			setTimeout(async () => {
				if (current_id !== uid) return;

				const result = await bundle({ uid, files, options });

				if (JSON.stringify(result.error) === JSON.stringify(ABORT)) return;
				if (result && uid === current_id) postMessage(result);
			});

			break;
		}
	}
});

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
				conditions: ['svelte', 'module', 'browser', 'development']
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

const versions = Object.create(null);

let previous: {
	key: string;
	cache: RollupCache | undefined;
};

let tailwind: Awaited<ReturnType<typeof init_tailwind>>;

async function init_tailwind() {
	const tailwind_files: Record<string, string> = {
		'tailwindcss/theme.css': tailwind_theme,
		'tailwindcss/preflight.css': tailwind_preflight,
		'tailwindcss/utilities.css': tailwind_utilities
	};

	const tailwind_base = [
		`@layer theme, base, components, utilities;`,
		`@import "tailwindcss/theme.css" layer(theme);`,
		`@import "tailwindcss/preflight.css" layer(base);`,
		`@import "tailwindcss/utilities.css" layer(utilities);`
	].join('\n');

	return await tailwindcss.compile(tailwind_base, {
		loadStylesheet: async (id, base) => {
			return { content: tailwind_files[id], base };
		}
	});
}

async function get_bundle(
	uid: number,
	mode: 'client' | 'server',
	local_files_lookup: Map<string, File>,
	options: BundleOptions
) {
	let bundle;

	/** A set of package names (without subpaths) to include in pkg.devDependencies when downloading an app */
	const imports: Set<string> = new Set();
	const warnings: Warning[] = [];
	const all_warnings: Array<{ message: string }> = [];

	const tailwind_candidates: string[] = [];

	function add_tailwind_candidates(ast: Node | undefined) {
		if (!ast) return;

		walk(ast, null, {
			ImportDeclaration() {
				// don't descend into these nodes, so that we don't
				// pick up import sources
			},
			Literal(node) {
				if (typeof node.value === 'string' && node.value) {
					tailwind_candidates.push(...node.value.split(' '));
				}
			},
			TemplateElement(node) {
				if (node.value.raw) {
					tailwind_candidates.push(...node.value.raw.split(' '));
				}
			}
		});
	}

	const repl_plugin: Plugin = {
		name: 'svelte-repl',
		async resolveId(importee, importer) {
			if (uid !== current_id) throw ABORT;

			if (importee === 'esm-env') return importee;

			if (importee === shared_file) return importee;

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

				const match = /^((?:@[^/]+\/)?[^/@]+)(?:@([^/]+))?(\/.+)?$/.exec(importee);
				if (!match) {
					return console.error(`Invalid import "${importee}"`);
				}

				const pkg_name = match[1];

				let default_version = 'latest';

				if (importer?.startsWith(packages_url)) {
					const path = importer.slice(packages_url.length + 1);
					const parts = path.split('/').slice(0, 2);
					if (!parts[0].startsWith('@')) parts.pop();

					const importer_name_and_version = parts.join('/');
					const importer_name = importer_name_and_version.slice(
						0,
						importer_name_and_version.indexOf('@', 1)
					);

					const default_versions = (versions[importer_name_and_version] ??= Object.create(null));

					if (!default_versions[pkg_name]) {
						const pkg_json_url = `${packages_url}/${importer_name_and_version}/package.json`;
						const pkg_json = (await fetch_if_uncached(pkg_json_url, uid))?.body;
						const pkg = JSON.parse(pkg_json ?? '""');

						if (importer_name === pkg_name) {
							default_versions[pkg_name] = pkg.version;
						} else {
							const version =
								pkg.devDependencies?.[pkg_name] ??
								pkg.peerDependencies?.[pkg_name] ??
								pkg.dependencies?.[pkg_name];

							default_versions[pkg_name] = max(version);
						}
					}

					default_version = default_versions[pkg_name];
				}

				const pkg_url =
					pkg_name === 'svelte'
						? `${svelte_url}/package.json`
						: `${packages_url}/${pkg_name}@${match[2] ?? default_version}/package.json`;
				const subpath = `.${match[3] ?? ''}`;

				// if this was imported by one of our files, add it to the `imports` set
				if (importer && local_files_lookup.has(importer)) {
					imports.add(pkg_name);
				}

				const fetch_package_info = async (pkg_url: string) => {
					try {
						const redirected = await follow_redirects(pkg_url, uid);

						if (!redirected) throw new Error();

						const pkg_json = (await fetch_if_uncached(redirected, uid))?.body;
						const pkg = JSON.parse(pkg_json ?? '""');

						const pkg_url_base = redirected.replace(/\/package\.json$/, '');

						return {
							pkg,
							pkg_url_base
						};
					} catch (_e) {
						throw new Error(`Error fetching "${pkg_name}" from unpkg. Does the package exist?`);
					}
				};

				const { pkg, pkg_url_base } = await fetch_package_info(pkg_url);

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
				return cached_file.contents;
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

			let result: CompileResult;

			if (id.endsWith('.svelte')) {
				const compilerOptions: any = {
					filename: name + '.svelte',
					generate: Number(svelte.VERSION.split('.')[0]) >= 5 ? 'client' : 'dom',
					dev: true
				};

				if (can_use_experimental_async) {
					compilerOptions.experimental = { async: true };
				}

				result = svelte.compile(code, compilerOptions);

				walk(result.ast.html as import('svelte/compiler').AST.TemplateNode, null, {
					Attribute(node) {
						if (Array.isArray(node.value)) {
							for (const chunk of node.value) {
								if (chunk.type === 'Text') {
									tailwind_candidates.push(...chunk.data.split(' '));
								}
							}
						}
					}
				});

				add_tailwind_candidates(result.ast.module);
				add_tailwind_candidates(result.ast.instance);

				if (result.css?.code) {
					// resolve local files by inlining them
					result.css.code = result.css.code.replace(
						/url\(['"]?(\..+?\.(svg|webp|png))['"]?\)/g,
						(match, $1, $2) => {
							if (local_files_lookup.has($1)) {
								if ($2 === 'svg') {
									return `url('data:image/svg+xml;base64,${btoa(local_files_lookup.get($1)!.contents)}')`;
								} else {
									return `url('data:image/${$2};base64,${local_files_lookup.get($1)!.contents}')`;
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
					import { styles as $$_styles } from '${shared_file}';
					const $$__style = document.createElement('style');
					$$__style.textContent = ${JSON.stringify(result.css.code)};
					document.head.append($$__style);
					$$_styles.push($$__style);
				`.replace(/\t/g, '');
				}
			} else if (id.endsWith('.svelte.js')) {
				const compilerOptions: any = {
					filename: name + '.js',
					generate: 'client',
					dev: true
				};

				if (can_use_experimental_async) {
					compilerOptions.experimental = { async: true };
				}

				result = svelte.compileModule?.(code, compilerOptions);

				if (!result) {
					return null;
				}
			} else {
				return null;
			}

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
		const key = JSON.stringify(options);

		bundle = await rollup({
			input: './__entry.js',
			cache: previous?.key === key && previous.cache,
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
				}),
				options.tailwind && {
					name: 'tailwind-extract',
					transform(code, id) {
						// TODO tidy this up
						if (id.startsWith(svelte_url)) return;
						if (id.endsWith('.svelte')) return;
						if (id === './__entry.js') return;
						if (id === 'esm-env') return;
						if (id === shared_file) return;
						if (id.startsWith('https://unpkg.com/clsx@')) return;

						add_tailwind_candidates(this.parse(code));
					}
				}
			],
			onwarn(warning) {
				all_warnings.push({
					message: warning.message
				});
			}
		});

		previous = { key, cache: bundle.cache };

		return {
			bundle,
			tailwind: options.tailwind
				? (tailwind ?? (await init_tailwind())).build(tailwind_candidates)
				: undefined,
			imports: Array.from(imports),
			error: null,
			warnings,
			all_warnings
		};
	} catch (error) {
		return { error, imports: null, bundle: null, warnings, all_warnings };
	}
}

export type BundleResult = ReturnType<typeof bundle>;

const shared_file = '$$__shared__.js';

async function bundle({
	uid,
	files,
	options
}: {
	uid: number;
	files: File[];
	options: BundleOptions;
}) {
	if (!DEV) {
		console.clear();
		console.log(`running Svelte compiler version %c${svelte.VERSION}`, 'font-weight: bold');
	}

	const lookup: Map<string, File> = new Map();

	lookup.set('./__entry.js', {
		type: 'file',
		name: '__entry.js',
		basename: '__entry.js',
		contents:
			version.split('.')[0] >= '5'
				? `
			import { unmount as u } from 'svelte';
			import { styles } from '${shared_file}';
			export { mount, untrack } from 'svelte';
			export {default as App} from './App.svelte';
			export function unmount(component) {
				u(component);
				styles.forEach(style => style.remove());
			}
		`
				: `
			import { styles } from '${shared_file}';
			export {default as App} from './App.svelte';
			export function mount(component, options) {
				return new component(options);
			}
			export function unmount(component) {
				component.$destroy();
				styles.forEach(style => style.remove());
			}
			export function untrack(fn) {
				return fn();
			}
		`,
		text: true
	});

	lookup.set(shared_file, {
		type: 'file',
		name: shared_file,
		basename: shared_file,
		contents: `
			export let styles = [];
		`,
		text: true
	});

	files.forEach((file) => {
		const path = `./${file.name}`;
		lookup.set(path, file);
	});

	let client: Awaited<ReturnType<typeof get_bundle>> = await get_bundle(
		uid,
		'client',
		lookup,
		options
	);

	try {
		if (client.error) {
			throw client.error;
		}

		const client_result = (
			await client.bundle?.generate({
				format: 'iife',
				exports: 'named',
				inlineDynamicImports: true
				// sourcemap: 'inline'
			})
		)?.output[0];

		const server = false // TODO how can we do SSR?
			? await get_bundle(uid, 'server', lookup, options)
			: null;

		if (server?.error) {
			throw server.error;
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
			tailwind: client.tailwind,
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
			error: { ...e, message: e.message } // not all Svelte versions return an enumerable message property
		};
	}
}
