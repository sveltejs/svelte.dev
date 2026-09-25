// @ts-check
import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { add, create, officialAddons } from 'sv';

// Generate the SvelteKit projects used by the playground's download feature.
const force = process.env.FORCE_UPDATE === 'true';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const output_dir = path.resolve(__dirname, 'svelte-template');
const repl_css = readFileSync(
	path.resolve(__dirname, '../../../packages/repl/src/lib/Output/srcdoc/styles.css'),
	'utf8'
);

/** @param {string} dir */
function get_all_files(dir) {
	/** @type {string[]} */
	const files = [];
	for (const item of readdirSync(dir, { withFileTypes: true })) {
		const full_path = path.join(dir, item.name);
		if (item.isDirectory()) {
			files.push(...get_all_files(full_path));
		} else {
			files.push(full_path.replaceAll('\\', '/'));
		}
	}
	return files;
}

/** @param {boolean} tailwind */
async function generate(tailwind) {
	const filename = tailwind ? 'svelte-tailwind-template.json' : 'svelte-template.json';
	const output_file = path.resolve(__dirname, '../static', filename);
	if (!force && existsSync(output_file)) {
		console.info(`[update/template] ${path.relative(process.cwd(), output_file)} exists. Skipping`);
		return;
	}

	if (existsSync(output_dir)) {
		throw new Error(`Temporary template directory already exists: ${output_dir}`);
	}

	try {
		create({ cwd: output_dir, template: 'minimal', types: 'typescript', name: 'your-app' });
		if (tailwind) {
			const result = await add({
				cwd: output_dir,
				addons: { tailwindcss: officialAddons.tailwindcss },
				options: { tailwindcss: { plugins: [] } }
			});
			if (result.status.tailwindcss !== 'success') {
				throw new Error('Could not add Tailwind to the playground template');
			}
		}

		/** @type {{ path: string; data: string | number[] }[]} */
		const files = [];
		for (const file of get_all_files(output_dir)) {
			const bytes = readFileSync(file);
			const string = bytes.toString();
			let data = bytes.compare(Buffer.from(string)) === 0 ? string : [...bytes];

			if (file.endsWith('routes/+page.svelte')) {
				data = `<script>\n${tailwind ? '' : "\timport '../app.css';\n"}\timport App from './App.svelte';\n</script>\n\n<App />\n`;
			} else if (tailwind && file.endsWith('src/routes/layout.css')) {
				data = `${data}\n${repl_css}`;
			}

			files.push({ path: file.slice(output_dir.length + 1), data });
		}

		files.push({
			path: 'src/routes/+page.js',
			data:
				"// Because we don't know whether or not your playground app can run in a server environment, we disable server-side rendering.\n" +
				'// Make sure to test whether or not you can re-enable it, as SSR improves perceived performance and site accessibility.\n' +
				'// Read more about this option here: https://svelte.dev/docs/kit/page-options#ssr\n' +
				'export const ssr = false;\n'
		});

		if (!tailwind) {
			files.push({ path: 'src/app.css', data: repl_css });
		}

		writeFileSync(output_file, JSON.stringify(files));
	} finally {
		rmSync(output_dir, { force: true, recursive: true });
	}
}

await generate(false);
await generate(true);
