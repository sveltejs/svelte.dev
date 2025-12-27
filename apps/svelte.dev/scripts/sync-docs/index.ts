import { strip_origin } from '@sveltejs/site-kit/markdown';
import { preprocess } from '@sveltejs/site-kit/markdown/preprocess';
import path from 'node:path';
import fs from 'node:fs';
import { parseArgs } from 'node:util';
import process from 'node:process';
import ts from 'typescript';
import glob from 'tiny-glob/sync.js';
import chokidar from 'chokidar';
import { fileURLToPath } from 'node:url';
import { clone_repo, migrate_meta_json } from './utils.ts';
import { get_types, read_d_ts_file, read_types } from './types.ts';
import type { Modules } from '@sveltejs/site-kit/markdown';

interface Package {
	name: string;
	repo: string;
	branch: string;
	pkg: string;
	docs: string;
	types: string | null;
	process_modules?: (modules: Modules, pkg: Package) => Promise<Modules>;
}

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

const branches = {};

for (const option of parsed.positionals) {
	const [name, ...rest] = option.split('#');

	if (branches[name]) {
		throw new Error(`Duplicate branches for ${name}`);
	}

	branches[name] = rest.join('#') || 'main';
}

const packages: Package[] = [
	{
		name: 'svelte',
		repo: `${parsed.values.owner}/svelte`,
		branch: branches['svelte'] ?? 'main',
		pkg: 'packages/svelte',
		docs: 'documentation/docs',
		types: 'types',
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
		repo: `${parsed.values.owner}/kit`,
		branch: branches['kit'] ?? 'main',
		pkg: 'packages/kit',
		docs: 'documentation/docs',
		types: 'types',
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
		repo: `${parsed.values.owner}/cli`,
		branch: branches['cli'] ?? 'main',
		pkg: 'packages/cli',
		docs: 'documentation/docs',
		types: null
	},
	{
		name: 'mcp',
		repo: `${parsed.values.owner}/mcp`,
		branch: branches['mcp'] ?? 'main',
		pkg: 'packages/mcp-stdio',
		docs: 'documentation/docs',
		types: null
	}
];

const unknown = Object.keys(branches).filter((name) => !packages.some((pkg) => pkg.name === name));

if (unknown.length > 0) {
	throw new Error(
		`Valid repos are ${packages.map((pkg) => pkg.name).join(', ')} (saw ${unknown.join(', ')})`
	);
}

const filtered =
	parsed.positionals.length === 0 ? packages : packages.filter((pkg) => !!branches[pkg.name]);

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
	}
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

if (parsed.values.watch) {
	for (const pkg of filtered) {
		chokidar
			.watch(`${REPOS}/${pkg.name}/${pkg.docs}`, { ignoreInitial: true })
			.on('all', (event) => {
				sync(pkg);
			});
	}

	console.log(`\nwatching for changes in ${filtered.map((pkg) => pkg.name).join(', ')}`);
}
