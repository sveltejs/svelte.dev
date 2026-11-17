import { describe, expect, test } from 'vitest';
import { render_content_markdown } from './renderer';
import type { DocumentationReferences } from './references.ts';

describe('render_content_markdown', () => {
	test.each([
		['.env', '<span class="filename" data-ext="">.env</span>'],
		['src/routes/+page.svelte', '<span class="filename" data-ext=".svelte">src/routes/+page</span>']
	])('renders the file banner for %s', async (filename, expected) => {
		const html = await render_content_markdown(
			'test.md',
			'```env\n/// file: ' + filename + '\nPUBLIC_THEME=steelblue\n```',
			{ check: false }
		);

		expect(html).toContain(expected);
	});

	test('preserves the line break after a highlighted JSDoc comment', async () => {
		const html = await render_content_markdown(
			'test.md',
			'```js\nlet value = 1;\n\n/** @type {number} */\nexport const count = value;\n```'
		);

		const js = html.match(/<pre data-js[^]*?<\/pre>/)?.[0];
		expect(js).toMatch(/<span class="comment">\*\/<\/span>\n<span class="keyword">export<\/span>/);
	});

	test('keeps multiline comments wrapped and indented', async () => {
		const html = await render_content_markdown(
			'test.md',
			'```js\nconst value = 1;\n\n/**\n * A multiline comment\n */\nexport const result = value;\n```'
		);

		const js = html.match(/<pre data-js[^]*?<\/pre>/)?.[0];
		expect(js).toContain('<span class="comment wrapped" style="--indent: 0ch">/**\n</span>');
		expect(js).toContain(
			'<span class="comment wrapped" style="--indent: 1ch"> * A multiline comment\n</span>'
		);
		expect(js).toContain('<span class="comment wrapped" style="--indent: 1ch"> */\n</span>');
	});

	test.each([
		['single-line', '\t// Cache the files\n\tconst cache = 1;'],
		['consecutive', '\t// Try the network first\n\t// Fall back to the cache\n\tconst cache = 1;'],
		['multiline', '\t/* Cache the files\n\t * for offline use */\n\tconst cache = 1;'],
		['blank line', '\t// Cache the files\n\n\tconst cache = 1;']
	])('preserves newlines after %s comments when copying code', async (_, body) => {
		const source = `function copy_example() {\n${body}\n}`;
		const html = await render_content_markdown('test.md', `\`\`\`js\n${source}\n\`\`\``, {
			check: false
		});
		const code = /<code[^>]*>([\s\S]*?)<\/code>/.exec(html)![1];

		expect(code.replace(/<[^>]*>/g, '')).toBe(source);
	});

	test('does not break twoslash popovers inside highlighted lines', async () => {
		const html = await render_content_markdown(
			'test.md',
			[
				'```js',
				'/**',
				' * @param {{',
				' *   message: string;',
				' * }} body',
				' */',
				'function fail(body) {}',
				'',
				"+++fail({ message: 'something went wrong' });+++",
				'```'
			].join('\n')
		);

		const start = html.indexOf('<span class="highlight add">');
		const line = html.slice(start, html.indexOf('</code>', start));

		expect(line).toContain('<span class="twoslash-popover"');
		expect(line).toContain('message');
		expect(line.match(/class="highlight add"/g)).toHaveLength(1);
		expect(line.match(/<span/g)?.length).toBe(line.match(/<\/span>/g)?.length);
	});
});

const references = {
	'@sveltejs/kit': { redirect: '/docs/kit/@sveltejs-kit#redirect' },
	'./$types': '/docs/kit/types#Generated-types'
} satisfies DocumentationReferences;

describe('direct documentation links', () => {
	test('links generated types in JS and converted TS', async () => {
		const html = await render_content_markdown(
			'generated.md',
			[
				'```js',
				'/// file: src/routes/+page.js',
				"/** @type {import('./$types').PageLoad} */",
				'export const value = {};',
				'```'
			].join('\n'),
			{ check: false, references }
		);
		for (const language of ['js', 'ts']) {
			const pre = html.match(new RegExp(`<pre data-${language}[^]*?<\\/pre>`))?.[0];
			expect(pre).toContain('class="doc-reference" href="/docs/kit/types#Generated-types"');
			expect(pre).toContain('>PageLoad</a>');
		}
	});

	test.each([undefined, 'false'])('respects link metadata %s', async (link) => {
		const html = await render_content_markdown(
			'opt-out.md',
			[
				'```ts',
				'/// file: example.ts',
				...(link ? [`/// link: ${link}`] : []),
				"import { redirect } from '@sveltejs/kit';",
				"redirect(303, '/');",
				'```'
			].join('\n'),
			{ check: false, references }
		);
		expect(html.includes('class="doc-reference"')).toBe(link !== 'false');
	});

	test('decorates cached snippets separately for each reference map and module context', async () => {
		const markdown = '```dts\nfunction fn(value: Load): Load;\n```';
		const render = (module: string, destination: string) =>
			render_content_markdown('cached.md', markdown, {
				referenceModule: module,
				references: { [module]: { Load: destination } }
			});
		const first = await render('first', '/first#Load');
		const second = await render('second', '/second#Load');
		const plain = await render_content_markdown('cached.md', markdown);
		expect(first).toContain('href="/first#Load"');
		expect(second).toContain('href="/second#Load"');
		expect(second).not.toContain('/first#Load');
		expect(plain).not.toContain('doc-reference');
	});
});
