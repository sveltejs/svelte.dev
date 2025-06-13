import '@sveltejs/site-kit/polyfills';
import { walk } from 'zimmerframe';
import '../patch_window';
import { rollup } from '@rollup/browser';
import { DEV } from 'esm-env';
import typescript_strip_types from './plugins/typescript';
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
import type { File } from '../../Workspace.svelte';
import type { Node } from 'estree';
import { max } from './semver';
import { NPM, VIRTUAL } from '../constants';
import {
	normalize_path,
	fetch_package,
	load_svelte,
	parse_npm_url,
	resolve_local,
	resolve_subpath,
	resolve_version,
	type Package
} from '../npm';
import type { BundleResult } from '$lib/public';

// hack for magic-string and rollup inline sourcemaps
// do not put this into a separate module and import it, would be treeshaken in prod
self.window = self;

const ENTRYPOINT = '__entry.js';
const STYLES = '__styles.js';
const ESM_ENV = '__esm-env.js';

let current_id: number;

let ready: ReturnType<typeof load_svelte>;

self.addEventListener('message', async (event: MessageEvent<BundleMessageData>) => {
	switch (event.data.type) {
		case 'init': {
			ready = load_svelte(event.data.svelte_version, (version) => {
				self.postMessage({
					type: 'version',
					message: version
				});
			});

			break;
		}

		case 'bundle': {
			try {
				const { svelte, version: svelte_version, can_use_experimental_async } = await ready;
				const { uid, files, options } = event.data;

				current_id = uid;

				setTimeout(async () => {
					if (current_id !== uid) return;

					const result = await bundle(
						svelte,
						svelte_version,
						uid,
						files,
						options,
						can_use_experimental_async
					);

					console.log('[bundle worker result]', result);

					if (JSON.stringify(result.error) === JSON.stringify(ABORT)) return;
					if (result && uid === current_id) postMessage(result);
				});
			} catch (e) {
				self.postMessage({
					type: 'error',
					uid: event.data.uid,
					message: `Error loading the compiler: ${(e as Error).message}`
				});
			}

			break;
		}
	}
});

const ABORT = { aborted: true };

let previous: {
	key: string;
	cache: RollupCache | undefined;
};

let tailwind: Awaited<ReturnType<typeof init_tailwind>>;

async function init_tailwind() {
	const tailwindcss = await import('tailwindcss');

	const { default: tailwind_preflight } = await import('tailwindcss/preflight.css?raw');
	const { default: tailwind_theme } = await import('tailwindcss/theme.css?raw');
	const { default: tailwind_utilities } = await import('tailwindcss/utilities.css?raw');

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
	svelte: typeof import('svelte/compiler'),
	svelte_version: string,
	uid: number,
	mode: 'client' | 'server',
	virtual: Map<string, File>,
	options: BundleOptions,
	can_use_experimental_async: boolean
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

			// entrypoint
			if (!importer) return `${VIRTUAL}/${ENTRYPOINT}`;

			// special case
			if (importee === 'esm-env') return `${VIRTUAL}/${ESM_ENV}`;

			// importing from a URL
			if (/^[a-z]+:/.test(importee)) return importee;

			/** The npm package we're importing from, if any */
			let current: null | Package;

			if (importer.startsWith(NPM)) {
				const { name, version } = parse_npm_url(importer);
				current = await fetch_package(name, name === 'svelte' ? svelte_version : version);
			}

			// importing a relative file
			if (importee[0] === '.') {
				if (importer.startsWith(VIRTUAL)) {
					const url = new URL(importee, importer);

					for (const suffix of ['', '.js', '.json', '.ts']) {
						const with_suffix = `${url.href.slice(VIRTUAL.length + 1)}${suffix}`;
						const file = virtual.get(with_suffix);

						if (file) {
							return url.href + suffix;
						}
					}

					throw new Error(
						`'${importee}' (imported by ${importer.replace(VIRTUAL + '/', '')}) does not exist`
					);
				}

				if (current) {
					const { name, version } = current.meta;
					const path = new URL(importee, importer).href.replace(`${NPM}/${name}@${version}/`, '');

					return normalize_path(current, path);
				}

				return new URL(importee, importer).href;
			}

			// importing a file from the same package via pkg.imports
			if (importee[0] === '#') {
				if (current) {
					const subpath = resolve_subpath(current, importee);
					return normalize_path(current, subpath.slice(2));
				}
				return await resolve_local(importee);
			}

			// importing an external package -> `npm://$/<name>@<version>/<path>`
			const match = /^((?:@[^/]+\/)?[^/@]+)(?:@([^/]+))?(\/.+)?$/.exec(importee);
			if (!match) throw new Error(`Invalid import "${importee}"`);

			const pkg_name = match[1];

			if (pkg_name === 'svelte' && svelte_version === 'local') {
				return await resolve_local(importee);
			}

			let default_version = 'latest';

			if (current) {
				// use the version specified in importer's package.json, not `latest`
				const { meta } = current;

				if (meta.name === pkg_name) {
					default_version = meta.version;
				} else {
					default_version = max(
						meta.devDependencies?.[pkg_name] ??
							meta.peerDependencies?.[pkg_name] ??
							meta.dependencies?.[pkg_name]
					);
				}
			}

			if (importer.startsWith(VIRTUAL)) {
				// if this was imported by one of our files, add it to the `imports` set
				imports.add(pkg_name);
			}

			const v = await resolve_version(match[1], match[2] ?? default_version);
			const pkg = await fetch_package(pkg_name, pkg_name === 'svelte' ? svelte_version : v);
			const subpath = resolve_subpath(pkg, '.' + (match[3] ?? ''));

			return normalize_path(pkg, subpath.slice(2));
		},
		async load(resolved) {
			if (uid !== current_id) throw ABORT;

			if (resolved.startsWith(VIRTUAL)) {
				const file = virtual.get(resolved.slice(VIRTUAL.length + 1))!;
				return file.contents;
			}

			if (resolved.startsWith(NPM)) {
				let [, name, v, subpath] = /^npm:\/\/\$\/((?:@[^/]+\/)?[^/@]+)(?:@([^/]+))?\/(.+)$/.exec(
					resolved
				)!;

				const pkg = await fetch_package(name, name === 'svelte' ? svelte_version : v);

				const file = pkg.contents[subpath];
				if (file) return file.text;
			}

			const response = await fetch(resolved);
			if (response.ok) return response.text();

			throw new Error(`Could not load ${resolved}`);
		},
		transform(code, id) {
			if (uid !== current_id) throw ABORT;

			const message = `bundling ${id.replace(VIRTUAL + '/', '').replace(NPM + '/', '')}`;
			self.postMessage({ type: 'status', message });

			if (!/\.(svelte|js|ts)$/.test(id)) return null;

			const name = id.split('/').pop()?.split('.')[0];

			let result: CompileResult;

			if (id.endsWith('.svelte')) {
				const is_gt_5 = Number(svelte.VERSION.split('.')[0]) >= 5;

				const compilerOptions: any = {
					filename: name + '.svelte',
					generate: is_gt_5 ? 'client' : 'dom',
					dev: true,
					fragments: options.fragments
				};

				if (is_gt_5) {
					compilerOptions.runes = options.runes;
				}

				if (can_use_experimental_async) {
					compilerOptions.experimental = { async: true };
				}

				if (compilerOptions.fragments == null) {
					// if fragments is not set it probably means we are using
					// a version that doesn't support it, so we need to remove it
					delete compilerOptions.fragments;
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
				add_tailwind_candidates(result.ast.html);

				if (result.css?.code) {
					// resolve local files by inlining them
					result.css.code = result.css.code.replace(
						/url\(['"]?\.\/(.+?\.(svg|webp|png))['"]?\)/g,
						(match, $1, $2) => {
							if (virtual.has($1)) {
								if ($2 === 'svg') {
									return `url('data:image/svg+xml;base64,${btoa(virtual.get($1)!.contents)}')`;
								} else {
									return `url('data:image/${$2};base64,${virtual.get($1)!.contents}')`;
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
					import { styles as $$_styles } from '${VIRTUAL}/${STYLES}';
					const $$__style = document.createElement('style');
					$$__style.textContent = ${JSON.stringify(result.css.code)};
					document.head.append($$__style);
					$$_styles.push($$__style);
				`.replace(/\t/g, '');
				}
			} else if (/\.svelte\.(js|ts)$/.test(id)) {
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

	const key = JSON.stringify(options);

	bundle = await rollup({
		input: './__entry.js',
		cache: previous?.key === key && previous.cache,
		plugins: [
			typescript_strip_types,
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
					if (id.startsWith(`${NPM}/svelte@`)) return;
					if (id.startsWith(`${NPM}/clsx@`)) return;
					if (id === `${VIRTUAL}/${ENTRYPOINT}`) return;
					if (id === `${VIRTUAL}/${STYLES}`) return;
					if (id === `${VIRTUAL}/${ESM_ENV}`) return;
					if (id.endsWith('.svelte')) return;

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
}

async function bundle(
	svelte: typeof import('svelte/compiler'),
	svelte_version: string,
	uid: number,
	files: File[],
	options: BundleOptions,
	can_use_experimental_async: boolean
): Promise<BundleResult> {
	if (!DEV) {
		console.log(`running Svelte compiler version %c${svelte.VERSION}`, 'font-weight: bold');
	}

	const lookup: Map<string, File> = new Map();

	lookup.set(ENTRYPOINT, {
		type: 'file',
		name: ENTRYPOINT,
		basename: ENTRYPOINT,
		contents:
			svelte.VERSION.split('.')[0] >= '5'
				? `
			import { unmount as u } from 'svelte';
			import { styles } from '${VIRTUAL}/${STYLES}';
			export { mount, untrack } from 'svelte';
			export {default as App} from './App.svelte';
			export function unmount(component) {
				u(component);
				styles.forEach(style => style.remove());
			}
		`
				: `
			import { styles } from '${VIRTUAL}/${STYLES}';
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

	lookup.set(STYLES, {
		type: 'file',
		name: STYLES,
		basename: STYLES,
		contents: `
			export let styles = [];
		`,
		text: true
	});

	lookup.set(ESM_ENV, {
		type: 'file',
		name: STYLES,
		basename: STYLES,
		contents: `
			export const BROWSER = true;
			export const DEV = true;
		`,
		text: true
	});

	files.forEach((file) => {
		lookup.set(file.name, file);
	});

	try {
		let client: Awaited<ReturnType<typeof get_bundle>> = await get_bundle(
			svelte,
			svelte_version,
			uid,
			'client',
			lookup,
			options,
			can_use_experimental_async
		);

		const client_result = (
			await client.bundle?.generate({
				format: 'iife',
				exports: 'named',
				inlineDynamicImports: true
				// sourcemap: 'inline'
			})
		)?.output[0];

		const server = false // TODO how can we do SSR?
			? await get_bundle(
					svelte,
					svelte_version,
					uid,
					'server',
					lookup,
					options,
					can_use_experimental_async
				)
			: null;

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
			error: null,
			client: client_result,
			server: server_result,
			tailwind: client.tailwind,
			imports: client.imports
		};
	} catch (err) {
		console.error(err);

		const e = err as CompileError; // TODO could be a non-Svelte error?

		return {
			uid,
			error: { ...e, message: e.message }, // not all Svelte versions return an enumerable message property
			client: null,
			server: null,
			tailwind: null,
			imports: null
		};
	}
}
