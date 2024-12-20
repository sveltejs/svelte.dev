// @ts-check
import { execSync } from 'node:child_process';
import {
	copyFileSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	rmSync,
	statSync,
	writeFileSync
} from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// This download the currente Vite template from Github, adjusts it to our needs, and saves it to static/svelte-template.json
// This is used by the Svelte REPL as part of the "download project" feature

const force = process.env.FORCE_UPDATE === 'true';
const output_file = fileURLToPath(new URL('../static/svelte-template.json', import.meta.url));
const output_dir = fileURLToPath(new URL('./svelte-template', import.meta.url));

try {
	if (!force && statSync(output_file)) {
		console.info(`[update/template] ${output_file} exists. Skipping`);
		process.exit(0);
	}
} catch {
	// fetch svelte app
	rmSync(output_dir, { force: true, recursive: true });
	execSync(`npx degit vitejs/vite/packages/create-vite/template-svelte-ts ${output_dir}`, {
		stdio: 'inherit'
	});

	// remove everything that's not needed
	rmSync(join(output_dir, 'src/assets'), { force: true, recursive: true });
	rmSync(join(output_dir, 'src/lib'), { force: true, recursive: true });
	rmSync(join(output_dir, 'src/app.css'), { force: true, recursive: true });
	rmSync(join(output_dir, 'src/App.svelte'), { force: true, recursive: true });
	rmSync(join(output_dir, 'src/main.ts'), { force: true, recursive: true });
	rmSync(join(output_dir, 'public'), { force: true, recursive: true });

	// add what we need
	mkdirSync(join(output_dir, 'public'));
	copyFileSync(
		fileURLToPath(new URL('../static/favicon.png')),
		join(output_dir, 'public/favicon.png')
	);

	// build svelte-app.json
	const files = [];

	function get_all_files(dir) {
		const files = [];
		const items = readdirSync(dir, { withFileTypes: true });

		for (const item of items) {
			const full_path = join(dir, item.name);
			if (item.isDirectory()) {
				files.push(...get_all_files(full_path));
			} else {
				files.push(full_path);
			}
		}

		return files;
	}

	const all_files = get_all_files(output_dir);

	for (let path of all_files) {
		const bytes = readFileSync(path);
		const string = bytes.toString();
		let data = bytes.compare(Buffer.from(string)) === 0 ? string : [...bytes];

		// handle some special cases
		path = path.slice(output_dir.length + 1);
		if (path.endsWith('_gitignore')) path = path.slice(0, -10) + '.gitignore';

		if (path.endsWith('index.html')) {
			data = /** @type {any} */ (data).replace(
				'<link rel="icon" type="image/svg+xml" href="/vite.svg" />',
				'<link rel="icon" type="image/png" href="/favicon.png" />'
			);
		}

		files.push({ path, data });
	}

	writeFileSync(output_file, JSON.stringify(files));

	// remove output dir afterwards to prevent it messing with Vite watcher
	rmSync(output_dir, { force: true, recursive: true });
}
