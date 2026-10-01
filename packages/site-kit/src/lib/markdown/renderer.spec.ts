import { describe, expect, test } from 'vitest';
import { render_content_markdown } from './renderer';

const svelte_fence = (source: string) => `\`\`\`svelte\n${source}\n\`\`\``;
const hover_types = (html: string) =>
	Array.from(html.matchAll(/class="twoslash-popover-type">([^]*?)<\/span><\/span>/g), (match) =>
		match[1].replace(/<[^>]*>/g, '')
	);

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

describe('Svelte Twoslash', () => {
	test.each(['', ' lang="ts"'])(
		'infers script and template types with <script%s>',
		async (lang) => {
			const html = await render_content_markdown(
				'types.md',
				svelte_fence(`<script${lang}>\nlet count = $state(0);\n</script>\n<p>{count}</p>`)
			);
			expect(hover_types(html).filter((type) => type === 'let count: number')).toHaveLength(2);
			expect(html).toContain('Declares reactive state.');
			expect(html).not.toContain('__sveltets');
		}
	);

	test('renders named JavaScript and generated TypeScript variants', async () => {
		const html = await render_content_markdown(
			'named.md',
			svelte_fence(
				'<!--- file: Counter.svelte --->\n<script>\n/** @type {number} */\nlet count = 0;\n</script>\n<p>{count}</p>'
			)
		);
		expect(html).toContain('<span class="filename" data-ext=".svelte">Counter</span>');
		expect(html).toContain('<pre data-js data-language="svelte"');
		expect(html).toContain('<pre data-ts data-language="svelte"');
		expect(hover_types(html).filter((type) => type === 'let count: number')).toHaveLength(4);
		expect(html).not.toContain('file:');
	});

	test.each([false, true])(
		'separates checked and unchecked caches (checked first: %s)',
		async (first) => {
			const body = svelte_fence(
				`<script>\nlet cached_${first} = 1;\n</script>\n<p>{cached_${first}}</p>`
			);
			for (const check of [first, !first, first]) {
				const html = await render_content_markdown('cache.md', body, { check });
				expect(html.includes('twoslash-hover')).toBe(check);
			}
		}
	);

	test('does not allow an unchecked cache to bypass strict diagnostics', async () => {
		const body = svelte_fence(
			'<script lang="ts">\nconst count: number = "wrong";\n</script>\n<p>{count}</p>'
		);
		await render_content_markdown('strict.md', body, { check: false });
		await expect(render_content_markdown('strict.md', body)).rejects.toThrow(
			'Error compiling snippet in strict.md'
		);
	});

	test('rejects invalid component syntax', async () => {
		await expect(render_content_markdown('invalid.md', svelte_fence('<div>'))).rejects.toThrow(
			'Error compiling snippet in invalid.md'
		);
	});

	test('honors explicit expected diagnostics inside the script', async () => {
		const html = await render_content_markdown(
			'expected.md',
			svelte_fence(
				'<script lang="ts">\n// @errors: 2322\nconst count: number = "wrong";\n</script>\n<p>{count}</p>'
			)
		);
		expect(hover_types(html)).toContain('const count: number');
		expect(html).not.toContain('@errors');
		expect(html).not.toContain('twoslash-error-line');
	});

	test.each(['cut', 'cut-before'])('hides script context with ---%s---', async (cut) => {
		const html = await render_content_markdown(
			'cut.md',
			svelte_fence(
				`<script>\nconst hidden = 1;\n// ---${cut}---\nlet count = $state(hidden);\n</script>\n<p>{count}</p>`
			)
		);
		expect(html).not.toContain('---cut');
		expect(hover_types(html).filter((type) => type === 'const hidden: 1')).toHaveLength(1);
		expect(hover_types(html).filter((type) => type === 'let count: number')).toHaveLength(2);
		expect(html).not.toContain('__sveltets');
	});

	test('hides script content after a cut-after marker', async () => {
		const html = await render_content_markdown(
			'cut-after.md',
			svelte_fence(
				'<script>\nlet count = $state(0);\n// ---cut-after---\nconst hidden = 1;\n</script>\n<p>{count}</p>'
			)
		);
		expect(html).not.toContain('>hidden</span>');
		expect(html).not.toContain('---cut');
		expect(hover_types(html)).toContain('let count: number');
	});

	test.each([
		'<script>\nlet count = $state(0);\n---$:--- +++const+++ double = +++$derived(count * 2)+++;\n</script>\n<p>{:::count:::} {double}</p>',
		'<script>\n---let count = 1;---\n+++let count = $state(0);+++\n</script>\n<p>{:::count:::}</p>',
		'<script>\nlet count = $state(0);\n</script>\n<button on---:---click={() => count++}>{:::count:::}</button>',
		'<script>\nlet count = $state(0);\n</script>\n---<p>Old</p>---+++<p>{:::count:::}</p>+++',
		'<script>\nlet count = $state(0);\nlet rest = { title: "counter" };\n</script>\n<p {...---$$restProps---+++rest+++}>{:::count:::}</p>'
	])('preserves annotations and meaningful hovers: %s', async (source) => {
		const html = await render_content_markdown('annotations.md', svelte_fence(source));
		expect(html).toContain('class="highlight remove"');
		expect(html).toContain('class="highlight"');
		expect(hover_types(html)).toContain('let count: number');
		expect(html.match(/<span\b/g)?.length).toBe(html.match(/<\/span>/g)?.length);
		expect(html).not.toContain('\f');
	});

	test('does not restore a hidden redaction into a visible one', async () => {
		const html = await render_content_markdown(
			'cut-annotations.md',
			svelte_fence(
				'<script>\n---const hidden = 1;---\n// ---cut---\n---const old = 2;---\n+++let count = $state(0);+++\n</script>\n<p>{count}</p>'
			)
		);
		expect(html).not.toContain('const hidden');
		expect(html).toContain('<span class="highlight remove">const old = 2;</span>');
		expect(hover_types(html)).toContain('let count: number');
	});

	test('keeps markup-only components copyable', async () => {
		const html = await render_content_markdown('markup.md', svelte_fence('<p>Hello</p>'));
		const code = /<code>([^]*?)<\/code>/.exec(html)![1];
		expect(code.replace(/<[^>]*>/g, '')).toBe('&lt;p&gt;Hello&lt;/p&gt;');
		expect(html).toContain('copy-to-clipboard');
	});
});
