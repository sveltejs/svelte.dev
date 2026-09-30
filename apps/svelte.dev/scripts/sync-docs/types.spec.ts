import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import ts from 'typescript';
import { afterAll, describe, expect, test } from 'vitest';
import { preprocess } from '@sveltejs/site-kit/markdown/preprocess';
import { get_types } from './types';

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
