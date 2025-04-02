import '@sveltejs/site-kit/polyfills';
import { walk } from 'zimmerframe';
import '../patch_window';
import { rollup } from '@rollup/browser';
import { DEV } from 'esm-env';
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
import { max } from './semver';
import { NPM, VIRTUAL } from './constants';
import { add_suffix, fetch_package, resolve_subpath, resolve_version } from './npm';

// hack for magic-string and rollup inline sourcemaps
// do not put this into a separate module and import it, would be treeshaken in prod
self.window = self;

let version: string;
let current_id: number;

let inited = Promise.withResolvers<typeof svelte>();

let can_use_experimental_async = false;

async function init(v: string) {
	version = await resolve_version('svelte', v);
	console.log(`Using Svelte compiler version ${version}`);

	const pkg = await fetch_package('svelte', version);

	const entry = version.startsWith('3.')
		? 'compiler.js'
		: version.startsWith('4.')
			? 'compiler.cjs'
			: 'compiler/index.js';

	const compiler = pkg.files.find((file) => file.name === `package/${entry}`)!.text;

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
			init(event.data.svelte_version).then(inited.resolve, inited.reject);
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

			if (importee === 'esm-env') {
				return importee;
			}

			if (importee === shared_file) {
				return `${VIRTUAL}/${shared_file}`;
			}

			if (importee === './__entry.js') {
				return `${VIRTUAL}/__entry.js`;
			}

			// importing from a URL
			if (/^[a-z]+:/.test(importee)) {
				return importee;
			}

			if (importee[0] === '.' && importer.startsWith(VIRTUAL)) {
				const url = new URL(importee, importer);

				for (const suffix of ['', '.js', '.json']) {
					const with_suffix = `.${url.pathname}${suffix}`;
					const file = local_files_lookup.get(with_suffix);

					if (file) {
						return url.href + suffix;
					}
				}

				throw new Error(`Could not resolve ${importee} from ${importer}`);
			}

			const importer_match = /^npm:\/\/\$\/((?:@[^/]+\/)?[^/@]+)(?:@([^/]+))?(\/.+)?$/.exec(
				importer
			);
			const importer_pkg =
				importer_match && (await fetch_package(importer_match[1], importer_match[2]));

			if (importee[0] === '.') {
				const url = new URL(importee, importer);
				const parts = url.pathname.slice(1).split('/');
				if (parts[0][0] === '@') parts.shift();
				parts.shift();
				const path = parts.join('/');

				return add_suffix(importer_pkg, path);
			}

			// bare import
			const match = /^((?:@[^/]+\/)?[^/@]+)(?:@([^/]+))?(\/.+)?$/.exec(importee);
			if (!match) throw new Error(`Invalid import "${importee}"`);

			const pkg_name = match[1];

			let default_version = 'latest';

			if (importer_pkg) {
				default_version =
					importer_pkg.meta.name === pkg_name
						? importer_pkg.meta.version
						: max(
								importer_pkg.meta.devDependencies?.[pkg_name] ??
									importer_pkg.meta.peerDependencies?.[pkg_name] ??
									importer_pkg.meta.dependencies?.[pkg_name]
							);
			}

			const version = await resolve_version(match[1], match[2] ?? default_version);

			const pkg = await fetch_package(pkg_name, version);

			let subpath = resolve_subpath(pkg, '.' + (match[3] ?? ''));

			return add_suffix(pkg, subpath.slice(2));
		},
		async load(resolved) {
			if (uid !== current_id) throw ABORT;

			if (resolved === 'esm-env') {
				return `export const BROWSER = true; export const DEV = true`;
			}

			if (resolved.startsWith(VIRTUAL)) {
				const file = local_files_lookup.get(`./${resolved.slice(VIRTUAL.length + 1)}`)!;
				return file.contents;
			}

			if (resolved.startsWith(NPM)) {
				let [, name, version, subpath = ''] =
					/^npm:\/\/\$\/((?:@[^/]+\/)?[^/@]+)(?:@([^/]+))?\/(.+)$/.exec(resolved)!;

				const pkg = await fetch_package(name, version);

				const file = pkg.contents[subpath];
				if (file) return file.text;
			}

			throw new Error(`Could not load ${resolved}`);
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
				add_tailwind_candidates(result.ast.html);

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
						if (id.startsWith(`${NPM}/svelte@`)) return;
						if (id.startsWith(`${NPM}/clsx@`)) return;
						if (id.endsWith('.svelte')) return;
						if (id === './__entry.js') return;
						if (id === 'esm-env') return;
						if (id === shared_file) return;

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

	lookup.set(`./${shared_file}`, {
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
