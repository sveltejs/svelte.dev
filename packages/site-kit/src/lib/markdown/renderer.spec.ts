import { describe, expect, test } from 'vitest';
import { render_content_markdown } from './renderer';

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
