/// <reference types="node" />
import { strip_origin } from '@sveltejs/site-kit/markdown';
import { preprocess } from '@sveltejs/site-kit/markdown/preprocess';
import path from 'node:path';
import fs from 'node:fs';
import { execSync } from 'node:child_process';
import { parseArgs } from 'node:util';
import process from 'node:process';
import ts from 'typescript';
import glob from 'tiny-glob/sync.js';
import chokidar from 'chokidar';
import { fileURLToPath } from 'node:url';
import { clone_repo, invoke, migrate_meta_json } from './utils.ts';
import { get_types, read_d_ts_file, read_types } from './types.ts';
import type { Modules } from '@sveltejs/site-kit/markdown';
import { generate_crosslinks } from './crosslinks.ts';

interface Package {
	name: string;
	/** The identifier used to trigger syncing (defaults to `name` if omitted) */
	trigger?: string;
	repo: string;
	branch: string;
	pkg: string;
	docs: string;
	types: string | null;
	npm_packages?: string[];
	process_modules?: (modules: Modules, pkg: Package) => Promise<Modules>;
	post_clone?: (dir: string) => Promise<void>;
}

const get_trigger = (pkg: Package) => pkg.trigger ?? pkg.name;

const parsed = parseArgs({
	args: process.argv.slice(2),
	options: {
		watch: {
			type: 'boolean',
			short: 'w'
		},
		pull: {
			type: 'boolean',
			short: 'p'
		},
		owner: {
			type: 'string',
			default: 'sveltejs'
		}
	},
	strict: true,
	allowPositionals: true
});

const dirname = fileURLToPath(new URL('.', import.meta.url));
const REPOS = path.join(dirname, '../../repos');
const DOCS = path.join(dirname, '../../content/docs');

const branches: Record<string, { downstream: string; branch: string }> = {};

for (const option of parsed.positionals) {
	const parts = option.split('#');
	if (parts.filter(Boolean).length !== 3) {
		throw new Error(
			`Invalid positional argument. Received ${option}, but format should be {upstream_name}#{downstream_name}#{branch}`
		);
	}
	const [upstream, downstream, branch] = parts;

	if (branches[upstream]) {
		throw new Error(`Duplicate branches for ${upstream}`);
	}

	branches[upstream] = {
		downstream: downstream || upstream,
		branch: branch || 'main'
	};
}

const get_downstream_repo = (name: string) => {
	const owner = parsed.values.owner || 'sveltejs';
	const downstream = branches[name]?.downstream || name;
	return `${owner}/${downstream}`;
};

function patch_node_modules(
	cloned_dir: string,
	pkg_subdir: string,
	npm_name: string,
	onlyDirs?: string[]
) {
	const source = path.join(cloned_dir, pkg_subdir);
	const target = path.join(dirname, '../../node_modules', npm_name);
	if (onlyDirs) {
		for (const dir of onlyDirs) {
			const t = path.join(target, dir);
			fs.rmSync(t, { recursive: true, force: true });
			fs.cpSync(path.join(source, dir), t, { recursive: true });
		}
	} else {
		fs.rmSync(target, { force: true });
		fs.symlinkSync(source, target);
	}
}

const packages: Package[] = [
	{
		name: 'svelte',
		repo: get_downstream_repo('svelte'),
		branch: branches['svelte']?.branch ?? 'main',
		pkg: 'packages/svelte',
		docs: 'documentation/docs',
		types: 'types',
		npm_packages: ['svelte'],
		post_clone: async (dir) => {
			patch_node_modules(dir, 'packages/svelte', 'svelte', ['types']);
		},
		process_modules: async (modules: Modules) => {
			// Remove $$_attributes from ActionReturn
			const module_with_ActionReturn = modules.find((m) =>
				m.types!.find((t) => t?.name === 'ActionReturn')
			);
			const new_children =
				module_with_ActionReturn?.types![1].overloads[0].children!.filter(
					(c) => c.name !== '$$_attributes'
				) || [];

			if (module_with_ActionReturn) {
				module_with_ActionReturn.types![1].overloads[0].children = new_children;
			}

			return modules;
		}
	},
	{
		name: 'kit',
		repo: get_downstream_repo('kit'),
		branch: branches['kit']?.branch ?? 'main',
		pkg: 'packages/kit',
		docs: 'documentation/docs',
		types: 'types',
		npm_packages: ['@sveltejs/kit'],
		post_clone: async (dir) => {
			patch_node_modules(dir, 'packages/kit', '@sveltejs/kit', ['types']);
		},
		process_modules: async (modules, pkg) => {
			const kit_base = `${REPOS}/${pkg.name}/${pkg.pkg}/`;

			{
				const code = read_d_ts_file(kit_base + 'src/types/private.d.ts');
				const node = ts.createSourceFile('private.d.ts', code, ts.ScriptTarget.Latest, true);

				// @ts-ignore
				modules.push({
					name: 'Private types',
					comment: '',
					...(await get_types(code, node.statements))
				});
			}

			const dir = kit_base + 'src/types/synthetic';
			for (const file of fs.readdirSync(dir)) {
				if (!file.endsWith('.md')) continue;

				const comment = strip_origin(read_d_ts_file(`${dir}/${file}`));

				modules.push({
					name: file.replace(/\+/g, '/').slice(0, -3),
					comment,
					exports: [],
					types: [],
					exempt: true
				});
			}

			const svelte_kit_module = modules.find((m) => m.name === '@sveltejs/kit');
			const svelte_kit_types = svelte_kit_module!.types!;
			const config = svelte_kit_types.find((t) => t.name === 'Config')!;
			const kit_config = svelte_kit_types.find((t) => t.name === 'KitConfig')!;
			const full_config = structuredClone(config);
			const full_kit_config = structuredClone(kit_config);

			// special case — we want these to be on a separate page
			config.overloads = kit_config.overloads = [];
			config.comment = kit_config.comment =
				'See the [configuration reference](/docs/kit/configuration) for details.';

			modules.push({
				name: 'Configuration',
				comment: '',
				exports: [],
				types: [full_config, full_kit_config],
				exempt: false
			});

			return modules;
		}
	},
	{
		name: 'cli',
		repo: get_downstream_repo('cli'),
		branch: branches['cli']?.branch ?? 'main',
		pkg: 'packages/sv',
		docs: 'documentation/docs',
		types: null,
		npm_packages: ['sv', '@sveltejs/sv-utils'],
		post_clone: async (dir) => {
			await invoke('npx', ['pnpm@10', 'install'], { cwd: dir });
			await invoke('npx', ['pnpm@10', 'build'], { cwd: dir });
			patch_node_modules(dir, 'packages/sv', 'sv');
			patch_node_modules(dir, 'packages/sv-utils', '@sveltejs/sv-utils');
		}
	},
	{
		name: 'ai',
		trigger: 'ai-tools',
		repo: get_downstream_repo('ai-tools'),
		branch: branches['ai-tools']?.branch ?? 'main',
		pkg: 'packages/mcp-stdio',
		docs: 'documentation/docs',
		types: null
	},
	{
		name: 'vps',
		trigger: 'vite-plugin-svelte',
		repo: get_downstream_repo('vite-plugin-svelte'),
		branch: branches['vite-plugin-svelte']?.branch ?? 'main',
		pkg: 'packages/vite-plugin-svelte',
		docs: 'documentation/docs',
		types: null
	}
];

const unknown = Object.keys(branches).filter(
	(trigger) => !packages.some((pkg) => get_trigger(pkg) === trigger)
);

if (unknown.length > 0) {
	throw new Error(
		`Valid repos are ${packages.map((pkg) => get_trigger(pkg)).join(', ')} (saw ${unknown.join(', ')})`
	);
}

const filtered =
	parsed.positionals.length === 0
		? packages
		: packages.filter((pkg) => !!branches[get_trigger(pkg)]);

/** Retry `fn` every `interval`ms until it returns true or `timeout` is reached */
async function wait_until(fn: () => Promise<boolean>, interval = 10_000, timeout = 5 * 60_000) {
	const deadline = Date.now() + timeout;
	while (Date.now() < deadline) {
		if (await fn()) return true;
		const s = Math.round((deadline - Date.now()) / 1000);
		console.log(`Waiting for pkg.pr.new... (${s}s remaining)`);
		await new Promise((r) => setTimeout(r, interval));
	}
	return false;
}

function check_urls(urls: string[]) {
	// pkg.pr.new HEAD always returns 404, only GET gives the real status
	return Promise.all(
		urls.map((url) =>
			fetch(url)
				.then((r) => {
					r.body?.cancel();
					return r.ok;
				})
				.catch(() => false)
		)
	).then((r) => r.every(Boolean));
}

/** Update package.json with pkg.pr.new URLs so deploy previews get the right versions */
async function resolve_npm_packages(packages: Package[]) {
	// Locally, post_clone symlinks are enough. In CI, they don't persist — use pkg.pr.new instead.
	if (!process.env.CI) return;
	if (parsed.values.owner !== 'sveltejs') return;

	const entries: { name: string; url: string }[] = [];

	for (const pkg of packages) {
		if (!pkg.npm_packages?.length || pkg.branch === 'main') continue;

		const sha = execSync('git rev-parse HEAD', {
			cwd: `${REPOS}/${pkg.name}`,
			encoding: 'utf-8'
		}).trim();

		for (const npm_name of pkg.npm_packages) {
			entries.push({ name: npm_name, url: `https://pkg.pr.new/${pkg.repo}/${npm_name}@${sha}` });
		}
	}

	if (!entries.length) return;

	if (await wait_until(() => check_urls(entries.map((e) => e.url)))) {
		const pkg_json_path = path.join(dirname, '../../package.json');
		const pkg_json = JSON.parse(fs.readFileSync(pkg_json_path, 'utf-8'));
		for (const { name, url } of entries) {
			pkg_json.devDependencies[name] = url;
		}
		fs.writeFileSync(pkg_json_path, JSON.stringify(pkg_json, null, '\t') + '\n');
		execSync('pnpm install --lockfile-only', {
			cwd: path.join(dirname, '../../../..'),
			stdio: 'inherit'
		});
		console.log(`Using pkg.pr.new for: ${entries.map((e) => e.name).join(', ')}`);
	} else {
		console.log('pkg.pr.new timed out — deploy will use published npm versions');
	}
}

/** Update package.json to latest published npm versions (for main branch syncs) */
async function update_published_packages(packages: Package[]) {
	const names = packages
		.filter((pkg) => pkg.npm_packages?.length && pkg.branch === 'main')
		.flatMap((pkg) => pkg.npm_packages!);

	if (!names.length) return;

	const pkg_json_path = path.join(dirname, '../../package.json');
	const pkg_json = JSON.parse(fs.readFileSync(pkg_json_path, 'utf-8'));

	for (const name of names) {
		const latest = execSync(`npm view ${name} version`, { encoding: 'utf-8' }).trim();
		const section =
			pkg_json.dependencies?.[name] !== undefined ? 'dependencies' : 'devDependencies';
		pkg_json[section][name] = `^${latest}`;
	}

	fs.writeFileSync(pkg_json_path, JSON.stringify(pkg_json, null, '\t') + '\n');
	execSync('pnpm install --lockfile-only', {
		cwd: path.join(dirname, '../../../..'),
		stdio: 'inherit'
	});
}

/**
 * Depending on your setup, this will either clone the Svelte and SvelteKit repositories
 * or use the local paths you provided above to read the documentation files.
 * It will then copy them into the `content/docs` directory and process them to replace
 * placeholders for types with content from the generated types.
 */
if (parsed.values.pull) {
	try {
		fs.mkdirSync(REPOS);
	} catch {
		// ignore if it already exists
	}

	for (const pkg of filtered) {
		await clone_repo(`https://github.com/${pkg.repo}.git`, pkg.name, pkg.branch, REPOS);
		if (pkg.post_clone) {
			await pkg.post_clone(`${REPOS}/${pkg.name}`);
		}
	}

	await resolve_npm_packages(filtered);
}

const banner =
	'NOTE: do not edit this file, it is generated in apps/svelte.dev/scripts/sync-docs/index.ts';

async function sync(pkg: Package) {
	if (!fs.existsSync(`${REPOS}/${pkg.name}/${pkg.docs}`)) {
		console.warn(`No linked repo found for ${pkg.name}`);
		return;
	}

	const dest = `${DOCS}/${pkg.name}`;

	fs.rmSync(dest, { force: true, recursive: true });
	fs.cpSync(`${REPOS}/${pkg.name}/${pkg.docs}`, dest, { recursive: true });
	migrate_meta_json(dest);

	let modules: Modules = [];

	if (pkg.types !== null) {
		modules = await read_types(`${REPOS}/${pkg.name}/${pkg.pkg}/${pkg.types}/`, []);
		await pkg.process_modules?.(modules, pkg);
	}

	for (const file of glob(`${dest}/**/*.md`)) {
		const content = await preprocess(file, modules);

		fs.writeFileSync(file, content.replace('---', '---\n' + banner));
	}
}

for (const pkg of filtered) {
	await sync(pkg);
}

generate_crosslinks();

if (parsed.values.pull) {
	await update_published_packages(filtered);
}

if (parsed.values.watch) {
	for (const pkg of filtered) {
		chokidar
			.watch(`${REPOS}/${pkg.name}/${pkg.docs}`, { ignoreInitial: true })
			.on('all', (event) => {
				sync(pkg);
				generate_crosslinks();
			});
	}

	console.log(`\nwatching for changes in ${filtered.map((pkg) => pkg.name).join(', ')}`);
}
