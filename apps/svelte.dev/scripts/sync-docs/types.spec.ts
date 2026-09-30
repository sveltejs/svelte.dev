import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import ts from 'typescript';
import { afterAll, describe, expect, test } from 'vitest';
import { preprocess } from '@sveltejs/site-kit/markdown/preprocess';
import { get_types, read_types } from './types';
import { render_content } from '../../src/lib/server/renderer';

const registration = `
	| {
		/**
		 * Whether to automatically register the service worker, if it exists.
		 * @default true
		 */
		register: true;
		/** Options for serviceWorker.register("...", options); */
		options?: RegistrationOptions;
	}
	| {
		/**
		 * Whether to automatically register the service worker, if it exists.
		 * @default true
		 */
		register?: false;
	}`;

const files = `{
	/**
	 * Determine which files in your static directory will be available in $service-worker.files.
	 * @default (filename) => !/\\.DS_Store/.test(filename)
	 */
	files?: (file: string) => boolean;
}`;

async function parse(type: string) {
	const code = `export interface KitConfig { serviceWorker?: ${type}; }`;
	const node = ts.createSourceFile('index.d.ts', code, ts.ScriptTarget.Latest, true);
	return get_types(code, node.statements);
}

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'sync-docs-types-'));
const template = path.join(directory, 'configuration.md');
fs.writeFileSync(template, '> EXPANDED_TYPES: Configuration#KitConfig');
afterAll(() => fs.rmSync(directory, { recursive: true, force: true }));

describe('get_types', () => {
	test.each([
		['Kit 2', `${files} & (${registration})`, ['files', 'register', 'options', 'register']],
		['Kit 3', registration, ['register', 'options', 'register']]
	])('expands service worker documentation for %s', async (_, type, names) => {
		const result = await parse(type);
		const service_worker = result.types[0].overloads[0].children[0];

		expect(service_worker.children.map((child) => child.name)).toEqual(names);
		expect(service_worker.children.filter((child) => child.name === 'register')).toEqual([
			expect.objectContaining({
				snippet: 'register: true;',
				comment: 'Whether to automatically register the service worker, if it exists.',
				bullets: ['- <span class="tag">default</span> `true`']
			}),
			expect.objectContaining({ snippet: 'register?: false;' })
		]);
		expect(service_worker.snippet).toContain('| {/*…*/}');
		expect(service_worker.snippet).not.toContain('/**');
		if (names.includes('files')) {
			expect(service_worker.snippet).toContain('{/*…*/} & (');
		}

		const markdown = await preprocess(template, [{ name: 'Configuration', ...result }]);
		expect(markdown).toContain('## serviceWorker');
		expect(markdown).toContain('Whether to automatically register the service worker');
		expect(markdown).toContain('register: true;');
		expect(markdown).toContain('register?: false;');
		expect(markdown).toContain('options?: RegistrationOptions;');
		expect(markdown).toContain('Options for serviceWorker.register');
		expect(markdown).toContain('<span class="tag">default</span> `true`');
		if (names.includes('files')) {
			expect(markdown).toContain('files?: (file: string) => boolean;');
			expect(markdown).toContain('$service-worker.files');
		}

		const html = await render_content('docs/kit/98-reference/50-configuration.md', markdown);
		expect(html).toContain('id="serviceWorker"');
		expect(html).toContain('Whether to automatically register the service worker');
		expect(html).toContain('RegistrationOptions');
	});

	test('renders the Kit 3 Vite reference using its module and Config export', async () => {
		const types_directory = path.join(directory, 'kit3');
		fs.mkdirSync(types_directory);
		fs.writeFileSync(
			path.join(types_directory, 'index.d.ts'),
			`declare module '@sveltejs/kit/vite' {
				export function sveltekit(config?: Config): unknown;
				export interface Config { serviceWorker?: ${registration}; }
			}`
		);
		const vite_template = path.join(types_directory, 'vite.md');
		fs.writeFileSync(
			vite_template,
			`---
title: @sveltejs/kit/vite
---

## sveltekit

> EXPORT_SNIPPET: @sveltejs/kit/vite#sveltekit

## Config

> EXPANDED_TYPES: @sveltejs/kit/vite#Config`
		);

		const modules = await read_types(types_directory + '/', []);
		const markdown = await preprocess(vite_template, modules);
		const section = markdown.split('## serviceWorker\n')[1];

		expect(markdown).toContain('function sveltekit(config?: Config): unknown;');
		expect(section).toContain('register: true;');
		expect(section).toContain('register?: false;');
		expect(section).toContain('options?: RegistrationOptions;');
		expect(section).toContain('Whether to automatically register the service worker');
		expect(section).toContain('<span class="tag">default</span> `true`');

		const html = await render_content('docs/kit/98-reference/15-@sveltejs-kit-vite.md', markdown);
		expect(html).toContain('id="serviceWorker"');
		expect(html).toContain('Whether to automatically register the service worker');
		expect(html).toContain('RegistrationOptions');
	});

	test('preserves undocumented union branches and trailing type syntax', async () => {
		const result = await parse(`(${files} | false | { enabled: boolean }) & OtherOptions`);
		const service_worker = result.types[0].overloads[0].children[0];
		expect(service_worker.snippet).toBe(
			'serviceWorker?: ({/*…*/} | false | { enabled: boolean }) & OtherOptions;'
		);
		expect(service_worker.children.map((child) => child.name)).toEqual(['files']);
	});

	test('continues expanding plain object types', async () => {
		const result = await parse(files);
		const service_worker = result.types[0].overloads[0].children[0];
		expect(service_worker.snippet).toBe('serviceWorker?: {/*…*/};');
		expect(service_worker.children[0].snippet).toBe('files?: (file: string) => boolean;');
	});

	test('does not expand objects without documentation', async () => {
		const result = await parse('{ register: boolean } | false');
		const service_worker = result.types[0].overloads[0].children[0];
		expect(service_worker.snippet).toBe('serviceWorker?: { register: boolean } | false;');
		expect(service_worker.children).toEqual([]);
	});

	test('expands nested properties and excludes private API documentation', async () => {
		const result = await parse(`{
			/** Registration settings. */
			settings?: (${registration});
			/** Private API. */
			internal?: boolean;
		}`);
		const service_worker = result.types[0].overloads[0].children[0];
		expect(service_worker.children.map((child) => child.name)).toEqual(['settings']);
		expect(service_worker.children[0].children.map((child) => child.name)).toEqual([
			'register',
			'options',
			'register'
		]);
	});
});
