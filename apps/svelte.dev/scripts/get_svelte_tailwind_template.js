// @ts-check
import { readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { create } from 'sv';

// This download the currente Vite template from Github, adjusts it to our needs, and saves it to static/svelte-template.json
// This is used by the Svelte REPL as part of the "download project" feature

const viteConfigTailwind =
	"import { sveltekit } from '@sveltejs/kit/vite';\nimport { defineConfig } from 'vite';\nimport tailwindcss from '@tailwindcss/vite'\nexport default defineConfig({\n\tplugins: [sveltekit(),tailwindcss()]\n});\n";

const force = process.env.FORCE_UPDATE === 'true';
const output_file = fileURLToPath(
	new URL('../static/svelte-tailwind-template.json', import.meta.url)
);
const output_dir = fileURLToPath(new URL('./svelte-tailwind-template', import.meta.url));

try {
	if (!force && statSync(output_file)) {
		console.info(`[update/template] ${output_file} exists. Skipping`);
		process.exit(0);
	}
} catch {
	// create Svelte-Kit skelton app
	create(output_dir, { template: 'minimal', types: 'typescript', name: 'your-app' });

	function get_all_files(dir) {
		const files = [];
		const items = readdirSync(dir, { withFileTypes: true });

		for (const item of items) {
			const full_path = join(dir, item.name);
			if (item.isDirectory()) {
				files.push(...get_all_files(full_path));
			} else {
				files.push(full_path.replaceAll('\\', '/'));
			}
		}

		return files;
	}

	const all_files = get_all_files(output_dir);
	const files = [];

	for (let path of all_files) {
		const bytes = readFileSync(path);
		const string = bytes.toString();
		let data = bytes.compare(Buffer.from(string)) === 0 ? string : [...bytes];

		// vite config to use along with Tailwind CSS
		if (path.endsWith('vite.config.ts')) {
			files.push({
				path: 'vite.config.ts',
				data: viteConfigTailwind
			});
		}

		// add Tailwind CSS as devDependencies
		if (path.endsWith('package.json')) {
			try {
				const pkg = JSON.parse(string);

				pkg.devDependencies ||= {};
				pkg.devDependencies['tailwindcss'] = '^4.1.8';
				pkg.devDependencies['@tailwindcss/vite'] = '^4.1.8';

				data = JSON.stringify(pkg, null, 2); // Pretty-print with 2 spaces
			} catch (err) {
				console.error('Failed to parse package.json:', err);
			}
		}

		if (path.endsWith('routes/+page.svelte')) {
			data = `<script>\n\timport '../app.css';\n\timport App from './App.svelte';\n</script>\n\n<App />\n`;
		}

		files.push({ path: path.slice(output_dir.length + 1), data });
	}

	files.push({
		path: 'src/routes/+page.js',
		data:
			"// Because we don't know whether or not your playground app can run in a server environment, we disable server-side rendering.\n" +
			'// Make sure to test whether or not you can re-enable it, as SSR improves perceived performance and site accessibility.\n' +
			'// Read more about this option here: https://svelte.dev/docs/kit/page-options#ssr\n' +
			'export const ssr = false;\n'
	});

	// add CSS styles from playground to the project

	files.push({
		path: 'src/app.css',
		data: '@import "tailwindcss";'
	});

	writeFileSync(output_file, JSON.stringify(files));

	// remove output dir afterwards to prevent it messing with Vite watcher
	rmSync(output_dir, { force: true, recursive: true });
}
