import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, test } from 'vitest';
import { preprocess } from './preprocess';
import { render_content_markdown } from './renderer';
import type { Declaration } from './index';

async function expand(comment: string, overloads: Declaration['overloads']) {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'expanded-type-'));
	const file = path.join(directory, 'config.md');

	try {
		fs.writeFileSync(file, '> EXPANDED_TYPES: @sveltejs/kit/vite#Config');
		return await preprocess(file, [
			{
				name: '@sveltejs/kit/vite',
				types: [
					{
						name: 'Config',
						comment,
						overloads
					}
				]
			}
		]);
	} finally {
		fs.rmSync(directory, { recursive: true, force: true });
	}
}

const child = (name: string) => ({
	name,
	snippet: `${name}: string`,
	comment: '',
	bullets: [],
	children: []
});

describe('expanded type placeholders', () => {
	test('separates a type comment from the first member heading', async () => {
		const markdown = await expand('An extension of the Vite options.', [
			{ snippet: '', children: [child('adapter')] }
		]);

		expect(markdown.startsWith('An extension of the Vite options.\n\n## adapter\n\n')).toBe(true);
		const html = await render_content_markdown('config.md', markdown, { check: false });
		expect(html).toContain('<h2 id="adapter"><span>adapter</span>');
	});

	test('preserves spacing for empty comments and multiple overloads', async () => {
		const markdown = await expand('', [
			{ snippet: '', children: [child('adapter'), child('alias')] },
			{ snippet: '', children: [child('paths')] }
		]);

		expect(markdown.startsWith('## adapter\n\n')).toBe(true);
		expect(markdown).toMatch(/\n\n## alias\n\n/);
		expect(markdown).toMatch(/\n\n## paths\n\n/);
	});

	test('generates scoped, unique property anchors across types, nested first children, heading collisions, overloads, includes, and special names', async () => {
		const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'scoped-props-'));
		const file = path.join(directory, 'reference.md');
		const included = path.join(directory, 'included.md');

		try {
			fs.writeFileSync(included, '> TYPES: $app/navigation#GotoOptions');
			fs.writeFileSync(
				file,
				[
					'> MODULE: $app/navigation',
					'',
					'## GotoOptions-custom',
					'',
					'## Private types',
					'',
					'> TYPES: Private types {depth=3}',
					'',
					'## Config',
					'',
					'> EXPANDED_TYPES: @sveltejs/kit/vite#Config',
					'',
					'@include included.md'
				].join('\n')
			);

			const markdown = await preprocess(file, [
				{
					name: '$app/navigation',
					exports: [
						{
							name: 'replaceState',
							comment: 'Replace current history entry.',
							overloads: [{ snippet: 'function replaceState(): void;', children: [] }]
						}
					],
					types: [
						{
							name: 'GotoOptions',
							comment: '',
							overloads: [
								{
									snippet: 'interface GotoOptions {/*…*/}',
									children: [
										{
											name: 'replace',
											snippet: 'replace?: boolean;',
											comment: 'Replaces history.',
											bullets: ['- <span class="tag">default</span> `false`'],
											children: []
										},
										{
											name: 'replaceState',
											snippet: 'replaceState?: boolean;',
											comment: '',
											bullets: [
												'- <span class="tag deprecated">deprecated</span> Use `replace` instead.'
											],
											children: []
										},
										{
											name: 'custom',
											snippet: 'custom?: string;',
											comment: 'Collides with ## GotoOptions-custom heading.',
											bullets: [],
											children: []
										},
										{
											name: 'custom',
											snippet: 'custom?: number;',
											comment: 'Overload/duplicate sibling.',
											bullets: [],
											children: []
										},
										{
											name: "'child-src'",
											snippet: "'child-src'?: string[];",
											comment: '',
											bullets: [],
											children: []
										},
										{
											name: '[uniqueSymbol]',
											snippet: '[uniqueSymbol]: true;',
											comment: '',
											bullets: [],
											children: []
										}
									]
								}
							]
						},
						{
							name: 'NavigationTarget',
							comment: '',
							overloads: [
								{
									snippet: 'interface NavigationTarget {/*…*/}',
									children: [
										{
											name: 'replace',
											snippet: 'replace?: boolean;',
											comment: '',
											bullets: [],
											children: []
										},
										{
											name: 'route',
											snippet: 'route: {/*…*/};',
											comment: '',
											bullets: [],
											children: [child('id')]
										}
									]
								}
							]
						}
					]
				},
				{
					name: 'Private types',
					types: [
						{
							name: 'Logger',
							comment: '',
							overloads: [
								{
									snippet: 'interface Logger {/*…*/}',
									children: [child('call'), child('call')]
								}
							]
						}
					]
				},
				{
					name: '@sveltejs/kit/vite',
					types: [
						{
							name: 'Config',
							comment: '',
							overloads: [
								{
									snippet: '',
									children: [
										{
											name: 'paths',
											snippet: 'paths?: {/*…*/};',
											comment: '',
											bullets: [],
											children: [
												{
													name: 'hooks',
													snippet: 'hooks?: {/*…*/};',
													comment: '',
													bullets: [],
													children: [child('client')]
												}
											]
										}
									]
								}
							]
						}
					]
				}
			]);

			const html = await render_content_markdown('reference.md', markdown, { check: false });

			// Existing type/page headings remain undisturbed
			expect(html).toContain('<h2 id="replaceState"><span>replaceState</span>');
			expect(html).toContain('<h2 id="GotoOptions"><span>GotoOptions</span>');
			expect(html).toContain('<h2 id="GotoOptions-custom"><span>GotoOptions-custom</span>');
			expect(html).toContain('<h3 id="Private-types-Logger"><span>Logger</span>');
			expect(html).toContain('<h2 id="paths"><span>paths</span>');

			// Scoped property anchors + permalinks
			expect(html).toContain(
				'<div class="ts-block-property" id="GotoOptions-replace"><a href="#GotoOptions-replace" class="permalink" aria-label="Permalink to replace"></a>'
			);
			expect(html).toContain(
				'<div class="ts-block-property" id="GotoOptions-replaceState"><a href="#GotoOptions-replaceState" class="permalink" aria-label="Permalink to replaceState"></a>'
			);
			// Heading collision + generated sibling collision
			expect(html).toContain('<div class="ts-block-property" id="GotoOptions-custom-2">');
			expect(html).toContain('<div class="ts-block-property" id="GotoOptions-custom-3">');
			// Included document shares page_ids so GotoOptions-replace becomes GotoOptions-replace-2
			expect(html).toContain('<div class="ts-block-property" id="GotoOptions-replace-2">');

			// Special names, nested first child, depth=3 heading scope, and EXPANDED_TYPES nested child
			expect(html).toContain('<div class="ts-block-property" id="GotoOptions-child-src">');
			expect(html).toContain('<div class="ts-block-property" id="GotoOptions-uniqueSymbol">');
			expect(html).toContain('<div class="ts-block-property" id="NavigationTarget-replace">');
			expect(html).toContain('<div class="ts-block-property" id="NavigationTarget-route">');
			expect(html).toContain(
				'<div class="ts-block-property-children"><div class="ts-block-property" id="NavigationTarget-route-id"><a href="#NavigationTarget-route-id" class="permalink" aria-label="Permalink to id"></a>'
			);
			expect(html).toContain('<div class="ts-block-property" id="Private-types-Logger-call">');
			expect(html).toContain('<div class="ts-block-property" id="Private-types-Logger-call-2">');
			expect(html).toContain('<div class="ts-block-property" id="paths-hooks">');
			expect(html).toContain('<div class="ts-block-property" id="paths-hooks-client">');

			// Every generated id attribute on the page is unique
			const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
			expect(new Set(ids).size).toBe(ids.length);
		} finally {
			fs.rmSync(directory, { recursive: true, force: true });
		}
	});
});
