// @ts-check
import { execSync } from 'node:child_process';
import { mkdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

	let idx = 0;

	for (const module of modules) {
		let content = `---\ntitle: ${module.name}\n---\n\n${module.comment}\n\n`;
		for (const _export of module.exports) {
			content += module_to_string(_export);
		}
		for (const type of module.types) {
			content += module_to_string(type);
		}
		writeFileSync(
			`${dir}/${idx.toLocaleString(undefined, { minimumIntegerDigits: 2 })}-${module.name.replace(/\W/g, '_')}.md`,
			content
		);
		idx++;
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
