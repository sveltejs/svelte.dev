// @ts-check
import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	stringify_expanded_type,
	stringify_module,
	stringify_type
} from '@sveltejs/site-kit/markdown';

// Adjust these as needed for your local setup
const svelte_path = '../../../../svelte/sites/svelte.dev';
const sveltekit_path = '../../../../svelte-kit/sites/kit.svelte.dev';

// Run script to generate type information from Svelte, then load the resulting JS file.
// Once everything's on svelte.dev simplify this process by using the generated JSON directly.
const svelte_script_path = fileURLToPath(
	new URL(`${svelte_path}/scripts/type-gen/index.js`, import.meta.url).href
);
const svelte_json_path = new URL(`${svelte_path}/src/lib/generated/type-info.js`, import.meta.url)
	.href;

execSync(`node ${svelte_script_path}`, {
	cwd: path.dirname(path.dirname(path.dirname(svelte_script_path)))
});

const { modules: svelte_modules } = await import(svelte_json_path);

write_module_to_md(svelte_modules, 'svelte');

// Same for SvelteKit
const sveltekit_script_path = fileURLToPath(
	new URL(`${sveltekit_path}/scripts/types/index.js`, import.meta.url).href
);
const sveltekit_json_path = new URL(
	`${sveltekit_path}/src/lib/generated/type-info.js`,
	import.meta.url
).href;

execSync(`node ${sveltekit_script_path}`, {
	cwd: path.dirname(path.dirname(path.dirname(sveltekit_script_path)))
});

const { modules: sveltekit_modules } = await import(sveltekit_json_path);

// TODO JSdoc points to kit.svelte.dev, rewrite those for now
for (const module of sveltekit_modules) {
	replace_strings(module, (str) =>
		str
			.replace(/(https:\/\/kit.svelte.dev)?\/docs\/([^#)]+)/g, (_, __, slug) =>
				slug === 'cli' || slug === 'modules' || slug === 'types' || slug === 'configuration'
					? `/docs/kit/reference/${slug}`
					: _
			)
			.replace(/\/docs\/kit\/reference\/modules#([^-]+)-([^-]+)-([^-)]+)/g, (_, p1, p2, p3) => {
				if (p1 === '$env') {
					return `/docs/kit/reference/$env-all#${p1}-${p2}-${p3}`;
				} else {
					return `/docs/kit/reference/${p1 === 'sveltejs' ? '@sveltejs' : p1}-${p2}#${p3}`;
				}
			})
			.replace(/\/docs\/cli/g, '/docs/kit/reference/cli')
	);
}

const config = sveltekit_modules
	.find((m) => m.name === '@sveltejs/kit')
	.types.find((t) => t.name === 'Config');

const kit_config = sveltekit_modules
	.find((m) => m.name === '@sveltejs/kit')
	.types.find((t) => t.name === 'KitConfig');

write_module_to_md(
	sveltekit_modules,
	'kit',
	`<!-- @include_start KitConfig -->\n${stringify_expanded_type(kit_config)}\n<!-- @include_end KitConfig -->\n\n` +
		`<!-- @include_start Config -->\n${stringify_type(config)}\n<!-- @include_end Config -->\n\n`
);

// Helper methods

function write_module_to_md(modules, name, additional = '') {
	const dir = `content/docs/${name}/98-reference`;

	let content =
		'---\ntitle: Generated Reference\n---\n\n' +
		'This file is generated. Do not edit. If you are doing a translation, ' +
		'remove the include comments in the other .md files instead and replace it with the translated output.\n\n';

	for (const module of modules) {
		const generated = stringify_module(module);
		content += `<!-- @include_start ${module.name} -->\n${generated}\n<!-- @include_end ${module.name} -->\n\n`;
	}

	content += additional;

	writeFileSync(path.join(dir, '_generated.md'), content);
}

function replace_strings(obj, replace) {
	for (let key in obj) {
		if (typeof obj[key] === 'object') {
			replace_strings(obj[key], replace);
		} else if (typeof obj[key] === 'string') {
			obj[key] = replace(obj[key]);
		}
	}
}
