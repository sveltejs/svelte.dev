// @ts-check
import { readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { create } from 'sv';

// This download the currente Vite template from Github, adjusts it to our needs, and saves it to static/svelte-template.json
// This is used by the Svelte REPL as part of the "download project" feature

const force = process.env.FORCE_UPDATE === 'true';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const output_file = path.resolve(__dirname, '../static/svelte-template.json');
const output_dir = path.resolve(__dirname, './svelte-template');

try {
	if (!force && statSync(output_file)) {
		const relative = path.relative(process.cwd(), output_file);
		console.info(`[update/template] ${relative} exists. Skipping`);
		process.exit(0);
	}
} catch {
	// create Svelte-Kit skelton app
	create(output_dir, { template: 'minimal', types: 'typescript', name: 'your-app' });

	function get_all_files(dir) {
		const files = [];
		const items = readdirSync(dir, { withFileTypes: true });

		for (const item of items) {
			const full_path = path.join(dir, item.name);
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
	const html = readFileSync(
		path.join(output_dir, '../../../../packages/repl/src/lib/Output/srcdoc/index.html'),
		{ encoding: 'utf-8' }
	);
	const css = html
		.slice(html.indexOf('<style>') + 7, html.indexOf('</style>'))
		.split('\n')
		.map((line) =>
			// remove leading \t
			line.slice(3)
		)
		.join('\n')
		.trimStart();
	files.push({
		path: 'src/app.css',
		data: css
	});

	writeFileSync(output_file, JSON.stringify(files));

	// remove output dir afterwards to prevent it messing with Vite watcher
	rmSync(output_dir, { force: true, recursive: true });
}
