import { init as init_lexer, parse } from 'es-module-lexer';
import { strip_types } from '@sveltejs/repl/typescript';
import { vfs } from '../generated/kit-node.js';
import { resolve, type Environment } from './resolve.ts';
import { extname, split_query, to_text } from './utils.ts';

export const lexer_ready = init_lexer;

/** File extensions that are served as JavaScript modules without an `?import` query */
const js_extensions = new Set(['.js', '.mjs', '.ts', '.svelte']);

export interface ModuleNode {
	/** path in the virtual filesystem, plus any meaningful query (e.g. `?raw`) */
	id: string;
	env: Environment;
	version: number;
	importers: Set<ModuleNode>;
	imports: Set<ModuleNode>;
	code: string | null;
	self_accepting: boolean;
	/** for `.css` modules on the server, the CSS itself */
	css: string | null;
}

export interface TransformOptions {
	defines: Record<string, string>;
	compiler_options: Record<string, any>;
}

export class ModuleGraph {
	env: Environment;
	nodes = new Map<string, ModuleNode>();

	constructor(env: Environment) {
		this.env = env;
	}

	get(id: string) {
		let node = this.nodes.get(id);

		if (!node) {
			node = {
				id,
				env: this.env,
				version: 0,
				importers: new Set(),
				imports: new Set(),
				code: null,
				self_accepting: false,
				css: null
			};

			this.nodes.set(id, node);
		}

		return node;
	}

	/** Returns the URL at which the current version of a module can be imported */
	url(id: string) {
		const node = this.get(id);
		const [path, query] = split_query(id);

		if (!js_extensions.has(extname(path)) && !query.has('raw') && !query.has('url')) {
			query.set('import', '');
		}

		if (node.version > 0) query.set('v', String(node.version));

		const search = query.size > 0 ? '?' + query.toString().replace(/=(&|$)/g, '$1') : '';

		return (this.env === 'server' ? '/@ssr' : '') + encodeURI(path) + search;
	}

	/** Converts a URL (as created by `url(...)`) back into a module ID */
	static id_from_url(pathname: string, search: string) {
		if (pathname.startsWith('/@ssr/')) pathname = pathname.slice(5);
		if (pathname.startsWith('/@fs/')) pathname = pathname.slice(4);

		const query = new URLSearchParams(search);
		query.delete('v');
		query.delete('import');
		query.delete('t');

		const rest = query.size > 0 ? '?' + query.toString().replace(/=(&|$)/g, '$1') : '';
		return decodeURI(pathname) + rest;
	}

	/**
	 * Marks a module (and, on the server, everything that imports it) as stale, so that
	 * it gets a new URL and is re-evaluated next time it is imported
	 */
	invalidate(id: string, seen = new Set<ModuleNode>()) {
		const node = this.nodes.get(id);
		if (!node) return;

		this.#invalidate_node(node, seen, this.env === 'server');
		return seen;
	}

	#invalidate_node(node: ModuleNode, seen: Set<ModuleNode>, propagate: boolean) {
		if (seen.has(node)) return;
		seen.add(node);

		node.version += 1;
		node.code = null;

		if (propagate) {
			for (const importer of node.importers) {
				this.#invalidate_node(importer, seen, propagate);
			}
		}
	}

	/**
	 * For the client: figure out which self-accepting modules need to be re-imported
	 * following a change to `id`. Returns `null` if a full reload is needed
	 */
	find_boundaries(id: string): ModuleNode[] | null {
		const node = this.nodes.get(id);
		if (!node) return [];

		const boundaries = new Set<ModuleNode>();
		const affected = new Set<ModuleNode>();

		const needs_reload = (node: ModuleNode, chain: Set<ModuleNode>): boolean => {
			if (chain.has(node)) return false; // circular
			affected.add(node);

			if (node.self_accepting) {
				boundaries.add(node);
				return false;
			}

			if (node.importers.size === 0) return true;

			const next = new Set(chain).add(node);

			for (const importer of node.importers) {
				if (needs_reload(importer, next)) return true;
			}

			return false;
		};

		if (needs_reload(node, new Set())) return null;

		// everything between the changed module and the boundaries needs a new URL
		for (const node of affected) {
			node.version += 1;
			node.code = null;
		}

		return [...boundaries];
	}

	/** Collects all CSS imported (directly or indirectly) by the given module */
	collect_css(id: string, styles: Record<string, string> = {}, seen = new Set<ModuleNode>()) {
		const node = this.nodes.get(id);
		if (!node || seen.has(node)) return styles;
		seen.add(node);

		if (node.css !== null) styles[node.id] = node.css;

		for (const dep of node.imports) {
			this.collect_css(dep.id, styles, seen);
		}

		return styles;
	}

	async load(id: string, options: TransformOptions): Promise<string> {
		const node = this.get(id);

		if (node.code === null) {
			const result = await transform(id, this.env, options);

			for (const dep of node.imports) dep.importers.delete(node);
			node.imports.clear();

			node.self_accepting = result.self_accepting;
			node.css = result.css;

			for (const dep_id of result.deps) {
				const dep = this.get(dep_id);
				node.imports.add(dep);
				dep.importers.add(node);
			}

			// replace the placeholders with versioned URLs
			node.code = result.code.replace(/__SANDBOX_IMPORT_(\d+)__/g, (_, i) => {
				return this.url(result.deps[+i]);
			});
		}

		return node.code;
	}
}

interface TransformResult {
	code: string;
	deps: string[];
	self_accepting: boolean;
	css: string | null;
}

export class TransformError extends Error {
	id: string;
	frame?: string;

	constructor(id: string, message: string, frame?: string) {
		super(message);
		this.id = id;
		this.frame = frame;
	}
}

async function transform(
	id: string,
	env: Environment,
	options: TransformOptions
): Promise<TransformResult> {
	const [path, query] = split_query(id);
	const contents = vfs.read(path);

	if (contents === undefined || vfs.is_dir(path)) {
		throw new TransformError(id, `Could not load ${path} (no such file)`);
	}

	let css: string | null = null;
	let code: string;

	const ext = extname(path);

	if (query.has('raw')) {
		code = `export default ${JSON.stringify(to_text(contents))};`;
	} else if (query.has('url')) {
		code = `export default ${JSON.stringify(path)};`;
	} else if (ext === '.svelte') {
		code = compile_component(path, to_text(contents), env, options);
	} else if (/\.svelte\.(js|ts)$/.test(path)) {
		code = compile_module(path, maybe_strip_types(path, to_text(contents)), env, options);
	} else if (ext === '.js' || ext === '.mjs') {
		code = to_text(contents);
	} else if (ext === '.ts') {
		code = maybe_strip_types(path, to_text(contents));
	} else if (ext === '.json') {
		code = `export default ${to_text(contents)};`;
	} else if (ext === '.css') {
		css = to_text(contents);
		code =
			env === 'client' ? create_css_module(path, css) : `export default ${JSON.stringify(css)};`;
	} else {
		// asset import
		code = `export default ${JSON.stringify(path)};`;
	}

	if (path.startsWith('/node_modules/@sveltejs/kit/')) {
		code = code.replace(/\b__SVELTEKIT_[A-Z_]+__\b/g, (match) => options.defines[match] ?? match);
	}

	code = code.replace(
		/\bimport\.meta\.env\b/g,
		JSON.stringify({
			DEV: true,
			PROD: false,
			SSR: env === 'server',
			MODE: 'development',
			BASE_URL: '/'
		})
	);

	// rewrite imports
	const deps: string[] = [];
	let imports;

	try {
		[imports] = parse(code, path);
	} catch (e: any) {
		throw new TransformError(id, `Failed to parse ${path}: ${e.message}`);
	}

	let result = '';
	let last = 0;

	for (const imported of imports) {
		if (imported.n === undefined || imported.d === -2) continue;

		let resolved;
		try {
			resolved = resolve(imported.n, path, env);
		} catch (e: any) {
			// dynamic imports (e.g. optional dependencies like `@opentelemetry/api`)
			// should only fail if they're actually used
			if (imported.d > -1) continue;
			throw new TransformError(id, e.message);
		}

		const placeholder = `__SANDBOX_IMPORT_${deps.length}__`;
		deps.push(resolved);

		result += code.slice(last, imported.s);
		result += imported.d > -1 ? JSON.stringify(placeholder) : placeholder;
		last = imported.e;
	}

	result += code.slice(last);
	code = result;

	let self_accepting = false;

	if (env === 'client' && code.includes('import.meta.hot')) {
		self_accepting = /import\.meta\.hot\.accept\(\s*(?![\s['"])/.test(code);

		code =
			`import { createHotContext as __sandbox_create_hot_context } from "/@sandbox/client.js";` +
			`import.meta.hot = __sandbox_create_hot_context(${JSON.stringify(id)});` +
			code;
	}

	return { code, deps, self_accepting, css };
}

function maybe_strip_types(path: string, code: string) {
	if (!path.endsWith('.ts')) return code;

	try {
		return strip_types(code);
	} catch (e: any) {
		throw new TransformError(path, `${path} ${e.message}`);
	}
}

function get_compiler() {
	const svelte = (globalThis as any).svelte;
	if (!svelte) throw new Error('Svelte compiler has not loaded');
	return svelte;
}

function compile_component(
	filename: string,
	source: string,
	env: Environment,
	options: TransformOptions
) {
	try {
		const result = get_compiler().compile(source, {
			...options.compiler_options,
			filename,
			generate: env,
			dev: true,
			hmr: env === 'client',
			css: 'injected'
		});

		// (only log client warnings, otherwise we'd get everything twice)
		if (env === 'client') {
			for (const warning of result.warnings) {
				console.warn(
					`${warning.filename}:${warning.start?.line}:${warning.start?.column} ${warning.message}`
				);
			}
		}

		return with_sourcemap(result.js);
	} catch (e: any) {
		throw to_transform_error(filename, e);
	}
}

function with_sourcemap(js: { code: string; map: any }) {
	if (!js.map) return js.code;

	// (`map.toUrl()` doesn't work in a worker, because it looks for `window.btoa`)
	const bytes = new TextEncoder().encode(JSON.stringify(js.map));
	let binary = '';
	for (let i = 0; i < bytes.length; i += 0x8000) {
		binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
	}

	return `${js.code}\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,${btoa(binary)}`;
}

function compile_module(
	filename: string,
	source: string,
	env: Environment,
	options: TransformOptions
) {
	try {
		const result = get_compiler().compileModule(source, {
			...options.compiler_options,
			filename,
			generate: env,
			dev: true
		});

		return with_sourcemap(result.js);
	} catch (e: any) {
		throw to_transform_error(filename, e);
	}
}

function to_transform_error(filename: string, e: any) {
	const location = e.start ? `${filename}:${e.start.line}:${e.start.column}` : filename;
	return new TransformError(filename, `${location} ${e.message}`, e.frame);
}

function create_css_module(path: string, css: string) {
	return `
const id = ${JSON.stringify(path)};
const css = ${JSON.stringify(css)};
let style = document.querySelector(\`style[data-sandbox-id="\${id}"]\`);
if (!style) {
	style = document.createElement('style');
	style.setAttribute('data-sandbox-id', id);
	document.head.appendChild(style);
}
style.textContent = css;
if (import.meta.hot) {
	import.meta.hot.accept();
	import.meta.hot.prune(() => style.remove());
}
export default css;
`;
}
