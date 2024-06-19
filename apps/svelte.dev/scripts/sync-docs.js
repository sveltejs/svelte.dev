// @ts-check
import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { stringify_module } from '@sveltejs/site-kit/markdown';

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

write_module_to_md(sveltekit_modules, 'kit');

// Helper methods

function write_module_to_md(modules, name) {
	const dir = `content/docs/${name}/98-reference`;

	let content =
		'---\ntitle: Generated Reference\n---\n\n' +
		'This file is generated. Do not edit. If you are doing a translation, ' +
		'remove the include comments in the other .md files instead and replace it with the translated output.\n\n';

	for (const module of modules) {
		const generated = stringify_module(module);
		content += `<!-- @include_start ${module.name} -->\n${generated}\n<!-- @include_end ${module.name} -->\n\n`;
	}

	writeFileSync(path.join(dir, '_generated.md'), content);
}
