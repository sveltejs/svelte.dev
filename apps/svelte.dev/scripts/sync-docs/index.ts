import { replace_export_type_placeholders, type Modules } from '@sveltejs/site-kit/markdown';
import path from 'node:path';
import { cpSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import ts from 'typescript';
import glob from 'tiny-glob/sync';
import { fileURLToPath } from 'node:url';
import { clone_repo, migrate_meta_json, replace_strings, strip_origin } from './utils';
import { get_types, read_d_ts_file, read_types } from './types';

interface Package {
	name: string;
	local: string;
	repo: string;
	pkg: string;
	docs: string;
	process_modules: (modules: Modules, pkg: Package) => Promise<Modules>;
	write: (modules: Modules) => Promise<void>;
}

const dirname = fileURLToPath(new URL('.', import.meta.url));
const REPOS = path.join(dirname, '../../repos');
const DOCS = path.join(dirname, '../../content/docs');

const packages: Package[] = [
	{
		name: 'svelte',
		local: `${REPOS}/svelte`,
		repo: 'sveltejs/svelte',
		pkg: 'packages/svelte',
		docs: 'documentation/docs',
		process_modules: async (modules: Modules) => {
			// Remove $$_attributes from ActionReturn
			const module_with_ActionReturn = modules.find((m) =>
				m.types!.find((t) => t?.name === 'ActionReturn')
			);
			const new_children =
				module_with_ActionReturn?.types![1].children!.filter((c) => c.name !== '$$_attributes') ||
				[];

			if (module_with_ActionReturn) {
				module_with_ActionReturn.types![1].children = new_children;
			}

			return modules;
		},
		write: async (modules: Modules) => {
			const files = glob(`${DOCS}/svelte/**/*.md`);

			for (const file of files) {
				const content = await replace_export_type_placeholders(
					readFileSync(file, 'utf-8'),
					modules
				);

				writeFileSync(file, content);
			}
		}
	},
	{
		name: 'kit',
		local: `${REPOS}/kit`,
		repo: 'sveltejs/kit',
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
			for (const file of readdirSync(dir)) {
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

			return modules;
		},
		write: async (modules) => {
			// TODO JSdoc points to kit.svelte.dev structure, rewrite those for now
			for (const module of modules) {
				replace_strings(module, (str) =>
					str
						.replace(/(https:\/\/kit.svelte.dev)?\/docs\/([^#)]+)/g, (_, __, slug) =>
							slug === 'cli' || slug === 'modules' || slug === 'types' || slug === 'configuration'
								? `/docs/kit/reference/${slug}`
								: _
						)
						.replace(
							/\/docs\/kit\/reference\/modules#([^-]+)-([^-]+)-([^-)]+)/g,
							(_, p1, p2, p3) => {
								if (p1 === '$env') {
									return `/docs/kit/reference/$env-all#${p1}-${p2}-${p3}`;
								} else {
									return `/docs/kit/reference/${p1 === 'sveltejs' ? '@sveltejs' : p1}-${p2}#${p3}`;
								}
							}
						)
						.replace(/\/docs\/cli/g, '/docs/kit/reference/cli')
				);
			}

			const svelte_kit_types = modules.find((m) => m.name === '@sveltejs/kit')!.types!;
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

			const kit_files = glob(`${DOCS}/kit/**/*.md`);

			for (const file of kit_files) {
				const content = await replace_export_type_placeholders(
					readFileSync(file, 'utf-8'),
					!file.includes('configuration')
						? modules
						: modules.map((m) =>
								m.name === '@sveltejs/kit' ? { ...m, types: [full_config, full_kit_config] } : m
							)
				);

				writeFileSync(file, content);
			}
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
		mkdirSync(REPOS);
	} catch {
		// ignore if it already exists
	}

	await Promise.all(packages.map((pkg) => clone_repo(`https://github.com/${pkg.repo}.git`, REPOS)));
}

for (const pkg of packages) {
	cpSync(`${pkg.local}/${pkg.docs}`, `${DOCS}/${pkg.name}`, { recursive: true });
	migrate_meta_json(`${DOCS}/${pkg.name}`);

	const modules = await pkg.process_modules(await read_types(`${pkg.local}/${pkg.pkg}/`, []), pkg);
	modules.sort((a, b) => (a.name! < b.name! ? -1 : 1));
	await pkg.write(modules);
}
