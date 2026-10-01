// A browser-based equivalent of SvelteKit's Vite dev server integration
// (`@sveltejs/kit/src/exports/vite/dev/index.js`). Where possible, we use
// SvelteKit's own code (bundled into `kit-node.js` with an in-memory `fs`)

import * as kit from '../generated/kit-node.js';
import { ModuleGraph } from './modules.ts';
import { resolve } from './resolve.ts';
import { to_bytes, to_text } from './utils.ts';

const { vfs } = kit;

const root = '/';
const generated = '/.svelte-kit/generated/dev';

export class KitDevServer {
	graphs = {
		client: new ModuleGraph('client'),
		server: new ModuleGraph('server')
	};

	config: any = null;
	compiler_options: Record<string, any> = {};
	defines: Record<string, string> = {};
	env: Record<string, string> = {};

	manifest_data: any = null;
	manifest: any = null;
	manifest_error: Error | null = null;

	get runtime_base() {
		return kit.get_runtime_base(root);
	}

	get transform_options() {
		return { defines: this.defines, compiler_options: this.compiler_options };
	}

	/** Import a module in the 'server' environment */
	async ssr_import(id: string) {
		const url = new URL(this.graphs.server.url(id), self.location.origin).href;
		return import(/* @vite-ignore */ url);
	}

	/** (Re)load everything — config, env, manifest */
	async init() {
		await this.load_config();
		this.load_env();
		await this.write_env_modules();
		await this.update_manifest();
	}

	async load_config() {
		let user_config: Record<string, any> = {};

		if (vfs.is_file('/vite.config.js')) {
			this.graphs.server.invalidate('/vite.config.js');
			const module = await this.ssr_import('/vite.config.js');

			let config = module.default;
			if (typeof config === 'function') {
				config = await config({ command: 'serve', mode: 'development' });
			}

			const plugins = (await Promise.all([config?.plugins ?? []].flat(Infinity))).flat(Infinity);
			const plugin = plugins.find((plugin: any) => plugin?.__sveltekit_config);

			if (plugin) user_config = plugin.__sveltekit_config;
		}

		const { svelte_config } = kit.split_config(user_config);
		const validated = kit.validate_config(svelte_config);
		this.config = kit.process_config(validated, root);

		this.compiler_options = { ...this.config.compilerOptions };

		const config = this.config;
		const s = JSON.stringify;

		this.defines = {
			__SVELTEKIT_APP_DIR__: s(config.appDir),
			__SVELTEKIT_APP_VERSION__: s(config.version.name),
			__SVELTEKIT_APP_VERSION_CHECKS_ENABLED__: s(config.output.bundleStrategy !== 'inline'),
			__SVELTEKIT_EMBEDDED__: s(config.embedded),
			__SVELTEKIT_FORK_PRELOADS__: s(config.experimental.forkPreloads),
			__SVELTEKIT_PATHS_ASSETS__: s(config.paths.assets),
			__SVELTEKIT_PATHS_BASE__: s(config.paths.base),
			__SVELTEKIT_PATHS_RELATIVE__: s(config.paths.relative),
			__SVELTEKIT_CLIENT_ROUTING__: s(config.router.resolution === 'client'),
			__SVELTEKIT_HASH_ROUTING__: s(config.router.type === 'hash'),
			__SVELTEKIT_SERVER_TRACING_ENABLED__: s(config.tracing.server),
			__SVELTEKIT_SUPPORTS_ASYNC__: s(this.compiler_options.experimental?.async ?? false),
			__SVELTEKIT_DEV__: 'true',
			__SVELTEKIT_GLOBAL_NAME__: s(kit.get_global_name(config.version.name, true)),
			__SVELTEKIT_CSRF_CHECK_ORIGIN__: s(!config.csrf.trustedOrigins.includes('*')),
			__SVELTEKIT_LINK_HEADER_PRELOAD__: s(config.output.linkHeaderPreload),
			__SVELTEKIT_PATHS_ORIGIN__: s(config.paths.origin) ?? 'undefined',
			__SVELTEKIT_SERVICE_WORKER__: 'false',
			__SVELTEKIT_APP_VERSION_POLL_INTERVAL__: '0',
			__SVELTEKIT_PAYLOAD__: `globalThis.${kit.get_global_name(config.version.name, true)}`,
			__SVELTEKIT_HAS_SERVER_LOAD__: 'true',
			__SVELTEKIT_HAS_UNIVERSAL_LOAD__: 'true',
			__SVELTEKIT_TRACK__: '(() => {})'
		};

		// everything needs to be recompiled with the new config
		this.reset_graphs();
	}

	reset_graphs() {
		// we can't reuse module instances, because they've been evaluated
		// with the old config, so we bump every version
		for (const graph of Object.values(this.graphs)) {
			for (const node of graph.nodes.values()) {
				node.version += 1;
				node.code = null;
			}
		}
	}

	load_env() {
		const env: Record<string, string> = {};

		for (const file of ['/.env', '/.env.local', '/.env.development', '/.env.development.local']) {
			const contents = vfs.read(file);
			if (contents === undefined) continue;

			for (const line of to_text(contents).split('\n')) {
				const match = /^\s*(?:export\s+)?([\w.-]+)\s*=\s*(.*)?\s*$/.exec(line);
				if (!match) continue;

				let value = (match[2] ?? '').trim();

				if (/^(['"`]).*\1$/.test(value)) {
					value = value.slice(1, -1);
					if (match[2]?.trim().startsWith('"')) value = value.replace(/\\n/g, '\n');
				} else {
					value = value.replace(/\s+#.*$/, '');
				}

				env[match[1]] = value;
			}
		}

		this.env = env;
	}

	async write_env_modules() {
		const entry = kit.resolve_env_entry(this.config, root);
		let variables = null;

		if (entry) {
			this.graphs.server.invalidate(entry);
			const module = await this.ssr_import(entry);
			variables = module.variables;

			if (!variables || typeof variables !== 'object') {
				throw new Error(`${entry} must export a variables object`);
			}

			for (const name of Object.keys(variables)) {
				if (!kit.valid_identifier.test(name) || kit.reserved.has(name)) {
					throw new Error(`Invalid environment variable name ${JSON.stringify(name)}`);
				}
			}
		}

		const dir = `${generated}/env`;
		const relative = entry && '../../../..' + entry;

		const modules = kit.create_env_modules(this.config, variables, this.env, dir, relative, true);

		for (const [file, code] of Object.entries(modules)) {
			const path = `${dir}/${file}`;
			if (vfs.read(path) !== code) {
				vfs.write(path, code as string);
				this.invalidate(path);
			}
		}
	}

	/** Regenerate `.svelte-kit/generated/dev` and the manifest */
	async update_manifest() {
		const before = snapshot(generated);

		try {
			this.manifest_data = kit.create_manifest_data(this.config, root);

			kit.write_app_manifest(generated, this.manifest_data, false);
			kit.write_client_manifest(this.config, this.manifest_data, `${generated}/client`, root);
			kit.write_server(this.config, generated, root);

			for (const [file, contents] of snapshot(generated)) {
				if (before.get(file) !== contents) this.invalidate(file);
			}

			await kit.load_and_validate_params({
				routes: this.manifest_data.routes,
				params_path: this.manifest_data.params,
				root,
				load: (file: string) => this.ssr_import(file)
			});

			this.manifest_error = null;
		} catch (error) {
			this.manifest_error = error as Error;
			console.error(this.manifest_error.message);
			return;
		}

		this.manifest = this.create_manifest();
	}

	/**
	 * Mark a file as changed. On the server, this means that it (and its importers) will
	 * be re-evaluated. On the client, it just means that it will be re-transformed —
	 * whether it's hot-updated or the page is reloaded is up to the caller
	 */
	invalidate(file: string) {
		const matches = (id: string) => id === file || id.startsWith(file + '?');

		for (const id of [...this.graphs.server.nodes.keys()]) {
			if (matches(id)) this.graphs.server.invalidate(id);
		}

		for (const [id, node] of this.graphs.client.nodes) {
			if (matches(id)) node.code = null;
		}
	}

	create_manifest() {
		const config = this.config;
		const manifest_data = this.manifest_data;

		const load = (file: string) => this.ssr_import(file.startsWith('/') ? file : '/' + file);

		return {
			appDir: config.appDir,
			appPath: config.appDir,
			assets: new Set(manifest_data.assets.map((asset: any) => asset.file)),
			mimeTypes: kit.get_mime_lookup(manifest_data),
			_: {
				client: {
					start: `${this.runtime_base}/client/entry.js`,
					app: `${generated}/client/app.js`,
					imports: [],
					stylesheets: [],
					fonts: [],
					uses_env_dynamic_public: true,
					nodes:
						config.router.resolution === 'client'
							? undefined
							: manifest_data.nodes.map((node: any, i: number) => {
									if (node.component || node.universal) {
										return `${config.paths.base}${generated}/client/nodes/${i}.js`;
									}
								}),
					routes:
						config.router.resolution === 'client'
							? undefined
							: manifest_data.routes
									.filter((route: any) => route.page)
									.map((route: any) => ({
										id: route.id,
										pattern: route.pattern,
										params: route.params,
										layouts: route.page.layouts.map((l: number | undefined) =>
											l !== undefined ? [!!manifest_data.nodes[l].server, l] : undefined
										),
										errors: route.page.errors,
										leaf: [!!manifest_data.nodes[route.page.leaf].server, route.page.leaf]
									}))
				},
				server_assets: new Proxy(
					{},
					{
						has: (_, file: string) => vfs.is_file(file),
						get: (_, file: string) => to_bytes(vfs.read(file) ?? '').length
					}
				),
				nodes: manifest_data.nodes.map((node: any, index: number) => {
					return async () => {
						const result: any = {};
						result.index = index;
						result.universal_id = node.universal;
						result.server_id = node.server;

						result.imports = [];
						result.stylesheets = [];
						result.fonts = [];

						const module_ids: string[] = [];

						if (node.component) {
							result.component = async () => {
								const id = '/' + node.component;
								module_ids.push(id);
								return (await load(id)).default;
							};
						}

						if (node.universal) {
							if (node.page_options?.ssr === false) {
								result.universal = node.page_options;
							} else {
								const id = '/' + node.universal;
								module_ids.push(id);
								result.universal = await load(id);
							}
						}

						if (node.server) {
							result.server = await load(node.server);
						}

						// in dev we inline all styles to avoid FOUC
						result.inline_styles = async () => {
							const styles: Record<string, string> = {};
							for (const id of module_ids) this.graphs.server.collect_css(id, styles);
							return styles;
						};

						return result;
					};
				}),
				prerendered_routes: new Set(),
				remotes: {},
				routes: manifest_data.routes
					.filter((route: any) => route.page || route.endpoint)
					.map((route: any) => {
						const endpoint = route.endpoint;

						return {
							id: route.id,
							pattern: route.pattern,
							params: route.params,
							page: route.page,
							endpoint: endpoint ? () => load(endpoint.file) : null,
							endpoint_id: endpoint?.file
						};
					}),
				matchers: async () => {
					if (!manifest_data.params) return {};

					const module = await load(manifest_data.params);

					if (!module.params) {
						throw new Error(
							`${manifest_data.params} does not export \`params\` from \`defineParams\``
						);
					}

					return module.params;
				}
			}
		};
	}

	async respond(request: Request): Promise<Response> {
		if (this.manifest_error) {
			const error_page = kit.load_error_page(this.config);
			const message = this.manifest_error.message ?? 'Invalid routes';

			return new Response(
				error_page
					.replace(/%sveltekit\.status%/g, '500')
					.replace(/%sveltekit\.error\.message%/g, escape_html(message)),
				{ status: 500, headers: { 'content-type': 'text/html; charset=utf-8' } }
			);
		}

		const { Server } = await this.ssr_import(`${this.runtime_base}/server/index.js`);

		const { set_fix_stack_trace } = await this.ssr_import(
			`${this.runtime_base}/server/internal.js`
		);
		set_fix_stack_trace((error: Error) => error.stack);

		const { set_assets } = await this.ssr_import(
			resolve('$app/paths/internal/server', root, 'server')
		);
		set_assets(this.config.paths.assets ? '/_svelte_kit_assets' : this.config.paths.base);

		const server = new Server(this.manifest);

		const read = (file: string) => {
			const contents = vfs.read(file) ?? vfs.read(`${this.config.files.assets}/${file}`);
			if (contents === undefined) throw new Error(`Could not read ${file}`);
			return to_bytes(contents);
		};

		await server.init({
			env: this.env,
			read: (file: string) => new Response(read(file) as BodyInit).body
		});

		return server.respond(request, {
			getClientAddress: () => '127.0.0.1',
			read
		});
	}
}

function snapshot(dir: string) {
	const files = new Map<string, string | Uint8Array>();

	for (const [file, contents] of vfs.files) {
		if (file.startsWith(dir + '/')) files.set(file, contents);
	}

	return files;
}

function escape_html(str: string) {
	return str.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}
