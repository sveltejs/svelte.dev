// @ts-check
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import glob from 'tiny-glob/sync.js';

const force = process.env.FORCE_UPDATE === 'true';

const dir = fileURLToPath(new URL('./svelte-app', import.meta.url));

const outputFile = 'static/svelte-app.json';

try {
	if (!force && fs.existsSync(outputFile)) {
		console.info(`[update/template] ${outputFile} exists. Skipping`);
		process.exit(0);
	}
} catch {
	// fetch svelte app
	fs.rmdirSync(dir);
	execSync(`npx degit sveltejs/template ${dir}`);

	// remove src (will be recreated client-side) and node_modules
	fs.rmdirSync(`${dir}/src`);
	fs.rmdirSync(`${dir}/node_modules`);

	// build svelte-app.json
	const appPath = dir;
	const files = [];

	for (const path of glob(`${dir}/**`)) {
		// Skip directories
		if (!fs.lstatSync(path).isFile()) continue;

		const bytes = fs.readFileSync(path);
		const string = bytes.toString();
		const data = bytes.compare(Buffer.from(string)) === 0 ? string : [...bytes];
		files.push({ path: path.slice(appPath.length + 1), data });
	}

	fs.writeFileSync(outputFile, JSON.stringify(files));
}
