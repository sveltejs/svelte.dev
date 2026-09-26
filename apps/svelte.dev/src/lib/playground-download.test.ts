import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { project_files, template_path, type DownloadFile } from './playground-download.js';

function generated_template(tailwind: boolean): DownloadFile[] {
	return JSON.parse(
		readFileSync(new URL(`../../static${template_path(tailwind)}`, import.meta.url), 'utf8')
	);
}

function contents(files: DownloadFile[], path: string): string {
	const data = files.find((file) => file.path === path)?.data;
	if (typeof data !== 'string') throw new Error(`Missing text file: ${path}`);
	return data;
}

describe('playground download', () => {
	test('selects the template matching the playground Tailwind setting', () => {
		expect(template_path(false)).toBe('/svelte-template.json');
		expect(template_path(true)).toBe('/svelte-tailwind-template.json');
	});

	test.each([false, true])('generates a usable %s template with playground styles', (tailwind) => {
		const files = generated_template(tailwind);
		expect(new Set(files.map(({ path }) => path)).size).toBe(files.length);
		expect(contents(files, 'src/routes/+page.js')).toContain('export const ssr = false');
		expect(contents(files, 'src/routes/+page.svelte')).toContain("import App from './App.svelte'");

		const css = contents(files, tailwind ? 'src/routes/layout.css' : 'src/app.css');

		if (tailwind) {
			expect(css).toContain("@import 'tailwindcss'");
			expect(contents(files, 'vite.config.ts')).toContain("from '@tailwindcss/vite'");
			expect(contents(files, 'src/routes/+layout.svelte')).toContain("import './layout.css'");
			expect(contents(files, 'package.json')).toContain('"tailwindcss"');
			expect(contents(files, 'package.json')).toContain('"@tailwindcss/vite"');
		} else {
			expect(contents(files, 'src/routes/+page.svelte')).toContain("import '../app.css'");
			expect(contents(files, 'package.json')).not.toContain('"tailwindcss"');
			expect(css).toContain('--bg-1:');
		}
	});

	test('preserves playground files and external imports without mutating the template', () => {
		const template = generated_template(true);
		const original_package = contents(template, 'package.json');
		const files = project_files(
			template,
			[
				{ name: 'App.svelte', contents: '<div class="text-red-500">Hello</div>' },
				{ name: 'theme.css', contents: '@theme { --color-brand: red; }' }
			],
			['@scope/example/component', 'lucide-svelte'],
			true
		);

		expect(contents(files, 'src/routes/App.svelte')).toContain('text-red-500');
		expect(contents(files, 'src/routes/theme.css')).toContain('@theme');
		expect(contents(files, 'src/routes/layout.css')).toContain("@import './theme.css'");
		const pkg = JSON.parse(contents(files, 'package.json'));
		expect(pkg.devDependencies['@scope/example']).toBe('latest');
		expect(pkg.devDependencies['lucide-svelte']).toBe('latest');
		expect(pkg.devDependencies['tailwindcss']).toBeDefined();
		expect(contents(template, 'package.json')).toBe(original_package);
	});

	test.each([false, true])('enables experimental async compilation (tailwind: %s)', (tailwind) => {
		const template = generated_template(tailwind);
		const original_config = contents(template, 'vite.config.ts');
		const files = project_files(template, [], [], tailwind, true);

		expect(contents(files, 'vite.config.ts')).toContain('experimental: { async: true },');
		expect(contents(template, 'vite.config.ts')).toBe(original_config);
	});

	test('leaves the Vite config unchanged when async mode is disabled', () => {
		const template = generated_template(false);
		const files = project_files(template, [], [], false, false);

		expect(contents(files, 'vite.config.ts')).toBe(contents(template, 'vite.config.ts'));
	});
});
