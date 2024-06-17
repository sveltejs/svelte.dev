// @ts-check
import { execSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { stringify_module } from '@sveltejs/site-kit/markdown';

/** @param {string} dir */
function mkdirp(dir) {
	try {
		mkdirSync(dir, { recursive: true });
	} catch (/** @type {any} */ e) {
		if (e.code === 'EEXIST') {
			if (!statSync(dir).isDirectory()) {
				throw new Error(`Cannot create directory ${dir}, a file already exists at this position`);
			}
			return;
		}
		throw e;
	}
}

function module_to_string(module, depth = 1) {
	let content = `#${'#'.repeat(depth)} ${module.name}\n\n`;

	if (module.snippet) {
		content += `\`\`\`typescript\n${module.snippet}\n\`\`\`\n\n`;
	}

	if (module.comment) {
		content += `${module.comment}\n\n`;
	}

	if (module.bullets?.length) {
		content += '> Bullets\n\n';
		for (const bullet of module.bullets) {
			content += `${bullet}\n`;
		}
		content += '\n';
	}

	for (const child of module.children) {
		content += module_to_string(child, depth + 1);
	}
	return content;
}

function write_module_to_md(modules, name) {
	const dir = `content/docs/${name}/98-reference`;
	mkdirp(dir);

	// read all files in the directory into an array
	const files = readdirSync(dir);
	const fileContents = {};

	for (const file of files) {
		const filePath = path.join(dir, file);
		const content = readFileSync(filePath, 'utf8');
		fileContents[file] = content;
	}

	// for each module, generate the markdown content and replace the include in the file
	// TODO support more granular includes
	for (const module of modules) {
		// let generated = `${module.comment}\n\n`;
		// for (const _export of module.exports) {
		// 	generated += module_to_string(_export);
		// }
		// for (const type of module.types) {
		// 	generated += module_to_string(type);
		// }
		const generated = stringify_module(module);

		for (const [name, content] of Object.entries(fileContents)) {
			const include_start_str = `<!-- @include_start ${module.name} -->`;
			const start_idx = content.indexOf(include_start_str);
			if (start_idx !== -1) {
				const include_end_str = `<!-- @include_end ${module.name} -->`;
				const end_idx = content.indexOf(include_end_str);
				if (end_idx === -1) {
					throw new Error(`Could not find end include for ${module.name}`);
				}
				const new_content =
					content.slice(0, start_idx + include_start_str.length) +
					'\n' +
					generated +
					'\n' +
					content.slice(end_idx);
				fileContents[name] = new_content;
			}
		}
	}

	for (const [name, content] of Object.entries(fileContents)) {
		writeFileSync(path.join(dir, name), content);
	}
}

// Run script to generate type information from SvelteKit, then load the resulting JS file.
// Once everything's on svelte.dev simplify this process by using the generated JSON directly.
const sveltekit_script_path = fileURLToPath(
	new URL('../../../../svelte-kit/sites/kit.svelte.dev/scripts/types/index.js', import.meta.url)
		.href
);
const sveltekit_json_path = new URL(
	'../../../../svelte-kit/sites/kit.svelte.dev/src/lib/generated/type-info.js',
	import.meta.url
).href;
execSync(`node ${sveltekit_script_path}`, {
	cwd: path.dirname(path.dirname(path.dirname(sveltekit_script_path)))
});
const { modules: sveltekit_modules } = await import(sveltekit_json_path);
write_module_to_md(sveltekit_modules, 'kit');
