import { preprocess } from '@sveltejs/site-kit/markdown/preprocess';
import path from 'node:path';
import fs from 'node:fs';
import ts from 'typescript';
import glob from 'tiny-glob/sync';
import chokidar from 'chokidar';
import { fileURLToPath } from 'node:url';
import { clone_repo, migrate_meta_json, strip_origin } from './utils';
import { get_types, read_d_ts_file, read_types } from './types';
import type { Modules } from '@sveltejs/site-kit/markdown';

interface Package {
	name: string;
	local: string;
	repo: string;
	branch: string;
	pkg: string;
	docs: string;
	process_modules: (modules: Modules, pkg: Package) => Promise<Modules>;
}

const dirname = fileURLToPath(new URL('.', import.meta.url));
const REPOS = path.join(dirname, '../../repos');
const DOCS = path.join(dirname, '../../content/docs');

const packages: Package[] = [
	{
		name: 'svelte',
		local: `${REPOS}/svelte`,
		repo: 'sveltejs/svelte',
		branch: 'main',
		pkg: 'packages/svelte',
		docs: 'documentation/docs',
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
		local: `${REPOS}/kit`,
		repo: 'sveltejs/kit',
		branch: 'svelte-dev-adjusted-docs', // TODO update!
		pkg: 'packages/kit',
		docs: 'documentation/docs',
		process_modules: async (modules, pkg) => {
			const kit_base = `${pkg.local}/${pkg.pkg}/`;

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
			const full_config = { ...config };
			const full_kit_config = { ...kit_config };

			// special case — we want these to be on a separate page
			config.children = kit_config.children = undefined;
			config.bullets = kit_config.bullets = undefined;
			config.snippet = kit_config.snippet = '';
			config.comment = kit_config.comment =
				'See the [configuration reference](/docs/kit/configuration) for details.';

			svelte_kit_module!.types = [full_config, full_kit_config];

			return modules;
		}
	}
];

/**
 * Depending on your setup, this will either clone the Svelte and SvelteKit repositories
 * or use the local paths you provided above to read the documentation files.
 * It will then copy them into the `content/docs` directory and process them to replace
 * placeholders for types with content from the generated types.
 */
if (process.env.USE_GIT === 'true') {
	try {
		fs.mkdirSync(REPOS);
	} catch {
		// ignore if it already exists
	}

	await Promise.all(
		packages.map((pkg) => clone_repo(`https://github.com/${pkg.repo}.git`, pkg.branch, REPOS))
	);
}

async function sync(pkg: Package) {
	const dest = `${DOCS}/${pkg.name}`;

	fs.rmSync(dest, { force: true, recursive: true });
	fs.cpSync(`${pkg.local}/${pkg.docs}`, dest, { recursive: true });
	migrate_meta_json(dest);

	const modules = await pkg.process_modules(await read_types(`${pkg.local}/${pkg.pkg}/`, []), pkg);

	const files = glob(`${dest}/**/*.md`);

	for (const file of files) {
		const content = await preprocess(file, modules);

		fs.writeFileSync(file, content);
	}
}

for (const pkg of packages) {
	await sync(pkg);
}

if (process.argv.includes('-w') || process.argv.includes('--watch')) {
	for (const pkg of packages) {
		chokidar
			.watch(`${REPOS}/${pkg.name}/${pkg.docs}`, { ignoreInitial: true })
			.on('all', (event) => {
				sync(pkg);
			});
	}
}
