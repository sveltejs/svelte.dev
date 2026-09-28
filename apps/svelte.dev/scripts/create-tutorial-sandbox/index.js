// Builds the assets needed by the 'sandbox' tutorial adapter, which runs a
// (subset of a) SvelteKit dev server in the browser without WebContainers:
//
// - `packages.json`: the runtime files for svelte, @sveltejs/kit and their
//   dependencies, which are mounted in the sandbox's virtual filesystem
// - `kit-node.js`: SvelteKit's node-side code (config validation, manifest
//   generation, `sync`, env module generation) bundled for the browser, with
//   `node:fs` etc replaced by an in-memory filesystem
// - `svelte-compiler.txt`: the (UMD) Svelte compiler, evaluated in the worker
//
// It relies on `scripts/create-tutorial-zip/common/node_modules`, which is
// installed by `scripts/create-tutorial-zip/index.js`, so that the versions are
// identical to the ones used by the WebContainer adapter.

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';

const here = fileURLToPath(new URL('.', import.meta.url));
const common = path.resolve(here, '../create-tutorial-zip/common');
const node_modules = `${common}/node_modules`;
const out = path.resolve(here, '../../src/lib/tutorial/adapters/sandbox/generated');

if (fs.existsSync(`${out}/packages.json`) && !process.argv.includes('--force=true')) {
	process.exit(0);
}

if (!fs.existsSync(node_modules)) {
	execSync('npm ci', { cwd: common, stdio: 'inherit' });
}

fs.mkdirSync(out, { recursive: true });

// 1. package snapshot

/** @type {Record<string, (file: string) => boolean>} */
const packages = {
	svelte: (file) =>
		file === 'package.json' || (file.startsWith('src/') && !file.startsWith('src/compiler/')),
	'@sveltejs/kit': (file) =>
		file === 'package.json' ||
		file === 'src/core/config/default-error.html' ||
		(file.startsWith('src/') &&
			!file.startsWith('src/core/') &&
			!file.startsWith('src/exports/vite/') &&
			!file.startsWith('src/exports/node/') &&
			file !== 'src/cli.js'),
	devalue: () => true,
	'esm-env': () => true,
	cookie: () => true,
	clsx: () => true
};

/** @type {Record<string, string>} */
const files = {};

for (const [name, filter] of Object.entries(packages)) {
	const dir = `${node_modules}/${name}`;

	for (const file of walk(dir)) {
		if (file.endsWith('.d.ts') || file.endsWith('.map') || file.endsWith('.md')) continue;
		if (!/\.(m?js|json|html|svelte)$/.test(file)) continue;
		if (file.includes('.spec.') || file.includes('/test/')) continue;
		if (!filter(file)) continue;

		files[`/node_modules/${name}/${file}`] = fs.readFileSync(`${dir}/${file}`, 'utf-8');
	}
}

const versions = Object.fromEntries(
	Object.keys(packages).map((name) => [
		name,
		JSON.parse(fs.readFileSync(`${node_modules}/${name}/package.json`, 'utf-8')).version
	])
);

fs.writeFileSync(`${out}/packages.json`, JSON.stringify({ versions, files }));

// 2. svelte compiler
fs.copyFileSync(`${node_modules}/svelte/compiler/index.js`, `${out}/svelte-compiler.txt`);

// 3. SvelteKit's node-side code, bundled for the browser
const kit = `${node_modules}/@sveltejs/kit/src`;
const shims = path.resolve(here, 'shims');

const entry = `
export { split_config, validate_config, process_config, load_template, load_error_page } from '${kit}/core/config/index.js';
export { default as create_manifest_data } from '${kit}/core/sync/create_manifest_data/index.js';
export { write_client_manifest } from '${kit}/core/sync/write_client_manifest.js';
export { write_server } from '${kit}/core/sync/write_server.js';
export { write_app_manifest } from '${kit}/core/sync/write_app_manifest.js';
export { create_env_modules, resolve_env_entry, reserved, valid_identifier } from '${kit}/core/env.js';
export { get_mime_lookup, get_runtime_base, runtime_directory, get_global_name } from '${kit}/core/utils.js';
export { load_and_validate_params } from '${kit}/utils/params.js';
export { resolve_entry } from '${kit}/utils/filesystem.js';
export { create_node_analyser, get_page_options } from '${kit}/exports/vite/static_analysis/index.js';
export { vfs } from '${shims}/fs.js';
`;

/** @type {esbuild.Plugin} */
const shim_plugin = {
	name: 'shims',
	setup(build) {
		/** @type {Record<string, string>} */
		const aliases = {
			fs: `${shims}/fs.js`,
			path: `${shims}/path.js`
		};

		build.onResolve({ filter: /^(node:)?(fs|path)$/ }, (args) => ({
			path: aliases[args.path.replace('node:', '')]
		}));

		build.onResolve({ filter: /^(node:)?(process|url|util|async_hooks)$/ }, (args) => ({
			path: args.path.replace('node:', ''),
			namespace: 'misc'
		}));

		build.onLoad({ filter: /.*/, namespace: 'misc' }, (args) => {
			const contents =
				args.path === 'process'
					? `import { process } from '${shims}/misc.js'; export default process;`
					: `export * from '${shims}/misc.js'; export { default } from '${shims}/misc.js';`;

			return { contents, resolveDir: shims, loader: 'js' };
		});

		// anything else node-ish, or vite, is unavailable
		build.onResolve({ filter: /^(node:|vite$|vite\/|sirv$|@rolldown\/)/ }, (args) => ({
			path: args.path,
			namespace: 'unsupported'
		}));

		build.onLoad({ filter: /.*/, namespace: 'unsupported' }, (args) => ({
			contents: `module.exports = new Proxy({}, { get(_, key) { if (key === '__esModule') return false; return () => { throw new Error(${JSON.stringify(args.path)} + '.' + String(key) + ' is not available in the sandbox'); }; } });`,
			loader: 'js'
		}));

		// SvelteKit uses `import.meta.url` to locate its own files — point it at the virtual filesystem
		build.onLoad({ filter: /@sveltejs\/kit\/src\/.*\.js$/ }, (args) => {
			const virtual =
				'/node_modules/@sveltejs/kit/src/' + args.path.split('/@sveltejs/kit/src/')[1];
			const contents = fs
				.readFileSync(args.path, 'utf-8')
				.replaceAll('import.meta.url', JSON.stringify(`file://${virtual}`));

			return { contents, loader: 'js' };
		});
	}
};

await esbuild.build({
	stdin: { contents: entry, resolveDir: kit, loader: 'js' },
	bundle: true,
	format: 'esm',
	platform: 'browser',
	target: 'es2022',
	outfile: `${out}/kit-node.js`,
	plugins: [shim_plugin],
	logLevel: 'warning',
	nodePaths: [node_modules],
	banner: { js: '// @ts-nocheck — generated by scripts/create-tutorial-sandbox' }
});

const names = [...entry.matchAll(/export \{([^}]+)\}/g)]
	.flatMap((match) => match[1].split(','))
	.map((name) =>
		name
			.trim()
			.split(/\s+as\s+/)
			.pop()
	)
	.filter((name) => name && name !== 'vfs');

fs.writeFileSync(
	`${out}/kit-node.d.ts`,
	`export const vfs: {
	files: Map<string, string | Uint8Array>;
	directories: Map<string, Set<string>>;
	write(file: string, contents: string | Uint8Array): void;
	remove(file: string): void;
	read(file: string): string | Uint8Array | undefined;
	is_file(file: string): boolean;
	is_dir(file: string): boolean;
};

${names.map((name) => `export const ${name}: any;`).join('\n')}
`
);

console.log(
	`created sandbox assets (${Object.keys(files).length} package files, ${(
		fs.statSync(`${out}/packages.json`).size / 1e6
	).toFixed(1)}MB)`
);

/** @param {string} dir @returns {string[]} */
function walk(dir, base = '') {
	/** @type {string[]} */
	const result = [];

	for (const entry of fs.readdirSync(`${dir}/${base}`, { withFileTypes: true })) {
		if (entry.name === 'node_modules') continue;
		const file = base ? `${base}/${entry.name}` : entry.name;
		if (entry.isDirectory()) result.push(...walk(dir, file));
		else result.push(file);
	}

	return result;
}
