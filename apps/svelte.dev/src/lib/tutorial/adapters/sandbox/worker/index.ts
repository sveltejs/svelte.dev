// The sandbox worker. It runs on the sandbox origin (created by the relay page) and
// acts as a SvelteKit dev server: it holds the project files in memory, transforms
// modules for the client and the server, runs SvelteKit's server runtime (loading
// server modules through the service worker via `import(...)`) and pushes HMR
// updates to the preview

import './patch.ts';
import * as kit from '../generated/kit-node.js';
import packages_url from '../generated/packages.json?url';
import compiler_url from '../generated/svelte-compiler.txt?url';
import client_code from './client.js?raw';
import { KitDevServer } from './kit.ts';
import { ModuleGraph, TransformError, lexer_ready } from './modules.ts';
import { clear_json_cache, type Environment } from './resolve.ts';
import { dirname, extname, get_mime_type, split_query, to_bytes } from './utils.ts';
import type { File, Item } from '@sveltejs/repl/workspace';

const { vfs } = kit;

const GENERATED = '/.svelte-kit/generated/dev';

interface SerializedRequest {
	url: string;
	method: string;
	headers: Array<[string, string]>;
	referrer: string;
	destination: string;
	mode: string;
	body: ArrayBuffer | null;
}

interface SerializedResponse {
	status: number;
	statusText: string;
	headers: Array<[string, string]>;
	body: ArrayBuffer | null;
}

let port: MessagePort | null = null;
const hmr = new BroadcastChannel('sandbox-hmr');
const server = new KitDevServer();

/** Files that belong to the project, as opposed to packages or generated files */
let project_files = new Map<string, string>();

const packages_ready = Promise.withResolvers<void>();
const initialised = Promise.withResolvers<void>();

// forward logs to the tutorial's terminal
for (const level of ['log', 'info', 'warn', 'error'] as const) {
	const original = console[level];
	console[level] = (...args: any[]) => {
		original(...args);

		// make stack traces more readable
		const text = args
			.map(format)
			.join(' ')
			.replaceAll(self.location.origin + '/@ssr', '')
			.replaceAll(self.location.origin, '');

		post({ type: 'log', level, text });
	};
}

function format(value: any): string {
	if (typeof value === 'string') return value;
	if (value instanceof Error) return value.stack ?? value.message;

	try {
		return JSON.stringify(value, null, 2) ?? String(value);
	} catch {
		return String(value);
	}
}

function post(data: any) {
	port?.postMessage(data);
}

self.onmessage = (e: MessageEvent) => {
	const { data } = e;

	if (data.type === 'init') {
		port = data.port as MessagePort;
		port.onmessage = (e) => handle_parent_message(e.data);
		boot();
	}

	if (data.type === 'request') {
		const reply = data.port as MessagePort;

		handle_request(data.request)
			.catch((error): SerializedResponse => {
				console.error(error);
				return {
					status: 500,
					statusText: 'Internal Error',
					headers: [['content-type', 'text/plain']],
					body: to_bytes(String(error?.stack ?? error)).buffer as ArrayBuffer
				};
			})
			.then((response) => {
				reply.postMessage(response, response.body ? [response.body] : []);
			});
	}
};

async function boot() {
	try {
		post({ type: 'status', text: 'loading packages', value: 0.2 });

		const [packages, compiler] = await Promise.all([
			fetch(packages_url).then((r) => r.json()),
			fetch(compiler_url).then((r) => r.text()),
			lexer_ready
		]);

		post({ type: 'status', text: 'loading svelte compiler', value: 0.6 });

		for (const [file, contents] of Object.entries(packages.files)) {
			vfs.write(file, contents as string);
		}

		(0, eval)(compiler);

		vfs.write(
			'/@sandbox/vite.js',
			'export const defineConfig = (config) => config;\nexport const loadEnv = () => ({});\n'
		);

		vfs.write(
			'/@sandbox/kit-vite.js',
			'export function sveltekit(config = {}) {\n\treturn [{ name: "vite-plugin-sveltekit", __sveltekit_config: config }];\n}\n'
		);

		packages_ready.resolve();
		post({ type: 'status', text: 'waiting for files', value: 0.8 });
		post({ type: 'booted' });
	} catch (error: any) {
		post({ type: 'fatal', message: error.message });
	}
}

// --- communication with the tutorial page ---

let queue = Promise.resolve();

function handle_parent_message(data: any) {
	queue = queue.then(async () => {
		try {
			await packages_ready.promise;

			let result;

			if (data.type === 'reset') {
				result = await reset(data.files);
			} else if (data.type === 'update') {
				result = await update(data.file);
			}

			post({ type: 'result', id: data.id, result });
		} catch (error: any) {
			console.error(error);
			post({ type: 'result', id: data.id, error: error.message });
		}
	});
}

function decode(file: File) {
	if (file.text) return file.contents;

	const binary = atob(file.contents);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
	return bytes;
}

function write(file: File) {
	const contents = decode(file);
	const previous = vfs.read(file.name);

	project_files.set(file.name, file.contents);

	if (previous !== undefined && same(previous, contents)) return false;

	vfs.write(file.name, contents);
	return true;
}

function same(a: string | Uint8Array, b: string | Uint8Array) {
	if (typeof a === 'string' || typeof b === 'string') return a === b;
	return a.length === b.length && a.every((byte, i) => byte === b[i]);
}

function remove(file: string) {
	vfs.remove(file);
	project_files.delete(file);

	// remove empty directories, so that they don't turn into routes
	let dir = dirname(file);
	while (dir !== '/' && vfs.is_dir(dir) && vfs.directories.get(dir)?.size === 0) {
		vfs.remove(dir);
		dir = dirname(dir);
	}
}

async function reset(items: Item[]) {
	const files = items.filter((item): item is File => item.type === 'file');
	const next = new Set(files.map((file) => file.name));

	const changed: string[] = [];

	for (const file of [...project_files.keys()]) {
		if (!next.has(file)) {
			remove(file);
			changed.push(file);
		}
	}

	for (const file of files) {
		if (write(file)) changed.push(file.name);
	}

	await apply_changes(changed, !server.config);

	initialised.resolve();
	hmr.postMessage({ type: 'clear-error' });

	return true;
}

async function update(file: File): Promise<boolean> {
	const is_new = !project_files.has(file.name);
	if (!write(file)) return false;

	const changed = await apply_changes([file.name], false);

	if (is_new) return true;

	/** Things that we need to hot-update */
	const updates = new Map<string, string>();

	for (const file of changed) {
		const ids = [...server.graphs.client.nodes.keys()].filter(
			(id) => id === file || id.startsWith(file + '?')
		);

		if (ids.length === 0) {
			// server-only (or unused) module. If it was used during SSR, reload
			if (server.graphs.server.nodes.has(file)) return true;
			continue;
		}

		for (const id of ids) {
			const boundaries = server.graphs.client.find_boundaries(id);
			if (!boundaries) return true;

			for (const boundary of boundaries) {
				updates.set(boundary.id, server.graphs.client.url(boundary.id));
			}
		}
	}

	if (updates.size > 0) {
		// transform eagerly, so that we can show errors
		for (const id of updates.keys()) {
			try {
				await server.graphs.client.load(id, server.transform_options);
			} catch (error) {
				report_error(error);
				return false;
			}
		}

		hmr.postMessage({
			type: 'update',
			updates: [...updates].map(([id, url]) => ({ id, url }))
		});
	}

	return false;
}

/**
 * Updates config/env/manifest in response to file changes, and returns the list of
 * all changed files (including generated ones)
 */
async function apply_changes(changed: string[], force: boolean) {
	clear_json_cache();

	const before = snapshot();

	for (const file of changed) server.invalidate(file);

	const config_changed = force || changed.includes('/vite.config.js');
	const env_changed =
		config_changed ||
		changed.some((file) => /^\/\.env/.test(file) || /^\/src\/env\.(js|ts)$/.test(file));

	try {
		if (config_changed) await server.load_config();
		if (env_changed) {
			server.load_env();
			await server.write_env_modules();
		}

		await server.update_manifest();
	} catch (error) {
		report_error(error);
	}

	const after = snapshot();
	const all = new Set(changed);

	for (const [file, contents] of after) {
		if (before.get(file) !== contents) all.add(file);
	}

	for (const file of before.keys()) {
		if (!after.has(file)) all.add(file);
	}

	if (config_changed || env_changed) {
		// treat everything as changed
		for (const id of server.graphs.client.nodes.keys()) all.add(split_query(id)[0]);
	}

	return [...all];
}

function snapshot() {
	const files = new Map<string, string | Uint8Array>();

	for (const [file, contents] of vfs.files) {
		if (file.startsWith(GENERATED + '/')) files.set(file, contents);
	}

	return files;
}

function report_error(error: any) {
	const message = error?.message ?? String(error);
	console.error(message + (error?.frame ? '\n' + error.frame : ''));
	hmr.postMessage({ type: 'error', message, frame: error?.frame });
}

// --- requests from the preview (via the service worker) ---

const cookies = new Map<string, { name: string; value: string; path: string; expires: number }>();

async function handle_request(req: SerializedRequest): Promise<SerializedResponse> {
	const url = new URL(req.url);

	if (url.pathname.startsWith('/@ssr/')) {
		await packages_ready.promise;
		return module_response('server', url);
	}

	await initialised.promise;

	if (url.pathname === '/@sandbox/client.js') {
		return text(client_code, 'text/javascript');
	}

	const id = ModuleGraph.id_from_url(url.pathname, url.search);
	const [path] = split_query(id);

	const asset = server.config.files.assets + path;
	if (vfs.is_file(asset)) return raw(asset);

	if (vfs.is_file(path) && !path.startsWith('/@sandbox/')) {
		const is_module_request =
			req.destination === 'script' ||
			req.destination === 'worker' ||
			url.searchParams.has('import') ||
			(req.destination !== 'document' && ['.js', '.mjs', '.ts', '.svelte'].includes(extname(path)));

		return is_module_request ? module_response('client', url) : raw(path);
	}

	const headers = new Headers(req.headers);

	const cookie = get_cookie_header(url.pathname);
	if (cookie) headers.set('cookie', cookie);

	if (req.method !== 'GET' && req.method !== 'HEAD' && !headers.has('origin')) {
		// the service worker doesn't see the `origin` header, but we need it for CSRF protection
		headers.set('origin', url.origin);
	}

	const request = new Request(url, {
		method: req.method,
		headers,
		body: req.body
	});

	const response = await server.respond(request);

	store_cookies(response.headers.getSetCookie());

	const response_headers: Array<[string, string]> = [];
	response.headers.forEach((value, key) => {
		if (key !== 'set-cookie') response_headers.push([key, value]);
	});

	const has_body = req.method !== 'HEAD' && response.status !== 204 && response.status !== 304;

	return {
		status: response.status,
		statusText: response.statusText,
		headers: response_headers,
		body: has_body ? await response.arrayBuffer() : null
	};
}

async function module_response(env: Environment, url: URL): Promise<SerializedResponse> {
	const id = ModuleGraph.id_from_url(url.pathname, url.search);

	try {
		const code = await server.graphs[env].load(id, server.transform_options);
		return text(code, 'text/javascript');
	} catch (error: any) {
		if (error instanceof TransformError && env === 'client') report_error(error);
		else console.error(error?.message ?? error);

		const message = error?.message ?? String(error);
		return text(`throw new Error(${JSON.stringify(message)});`, 'text/javascript');
	}
}

function text(body: string, type: string): SerializedResponse {
	return {
		status: 200,
		statusText: 'OK',
		headers: [
			['content-type', type],
			['cache-control', 'no-cache']
		],
		body: to_bytes(body).buffer as ArrayBuffer
	};
}

function raw(file: string): SerializedResponse {
	const contents = to_bytes(vfs.read(file) as string | Uint8Array);

	return {
		status: 200,
		statusText: 'OK',
		headers: [
			['content-type', get_mime_type(file)],
			['cache-control', 'no-cache']
		],
		body: contents.slice().buffer as ArrayBuffer
	};
}

function get_cookie_header(pathname: string) {
	const now = Date.now();
	const values: string[] = [];

	for (const [key, cookie] of cookies) {
		if (cookie.expires < now) {
			cookies.delete(key);
			continue;
		}

		const path = cookie.path.endsWith('/') ? cookie.path : cookie.path + '/';
		if (pathname === cookie.path || pathname.startsWith(path) || cookie.path === '/') {
			values.push(`${cookie.name}=${cookie.value}`);
		}
	}

	return values.join('; ');
}

function store_cookies(set_cookie: string[]) {
	for (const header of set_cookie) {
		const [pair, ...attributes] = header.split(';');
		const eq = pair.indexOf('=');
		const name = pair.slice(0, eq).trim();
		const value = pair.slice(eq + 1).trim();

		let path = '/';
		let expires = Infinity;

		for (const attribute of attributes) {
			const [key, val = ''] = attribute.split('=').map((s) => s.trim());
			const lower = key.toLowerCase();

			if (lower === 'path') path = val || '/';
			if (lower === 'max-age') expires = Date.now() + Number(val) * 1000;
			if (lower === 'expires' && expires === Infinity) expires = new Date(val).getTime();
		}

		const key = `${name};${path}`;

		if (expires <= Date.now()) {
			cookies.delete(key);
		} else {
			cookies.set(key, { name, value, path, expires });
		}
	}
}
