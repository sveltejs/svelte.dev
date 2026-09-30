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

const references: DocumentationReferences = {
	'@sveltejs/kit': {
		AfterNavigate: '/docs/kit/@sveltejs-kit#AfterNavigate',
		Load: '/docs/kit/@sveltejs-kit#Load',
		redirect: '/docs/kit/@sveltejs-kit#redirect'
	},
	svelte: { onMount: '/docs/svelte/svelte#onMount' },
	'./$types': {
		PageLoad: '/docs/kit/types#Generated-types',
		Actions: '/docs/kit/types#Generated-types'
	}
};

describe('direct documentation links', () => {
	test('links AfterNavigate in declaration snippets without Twoslash', async () => {
		const html = await render_content_markdown(
			'navigation.md',
			[
				'```dts',
				"function afterNavigate(callback: (navigation: import('@sveltejs/kit').AfterNavigate) => void): void;",
				'```'
			].join('\n'),
			{ references }
		);
		expect(html).toContain(
			`<a class="doc-reference" href="${references['@sveltejs/kit'].AfterNavigate}">AfterNavigate</a>`
		);
		expect(html).not.toContain('twoslash-popover');
		expect(html).not.toContain('twoslash-popup-reference');
	});

	test.each(['PageLoad', 'Actions'])('links generated %s in JS and converted TS', async (name) => {
		const annotation = name === 'Actions' ? 'satisfies' : 'type';
		const html = await render_content_markdown(
			'generated.md',
			[
				'```js',
				'/// file: src/routes/+page.js',
				`/** @${annotation} {import('./$types').${name}} */`,
				'export const value = {};',
				'```'
			].join('\n'),
			{ check: false, references }
		);
		for (const language of ['js', 'ts']) {
			const pre = html.match(new RegExp(`<pre data-${language}[^]*?<\\/pre>`))?.[0];
			expect(pre).toContain('class="doc-reference" href="/docs/kit/types#Generated-types"');
			expect(pre).toContain(`>${name}</a>`);
		}
	});

	test('links imported function bindings while retaining normal popovers', async () => {
		const html = await render_content_markdown(
			'functions.md',
			"```js\nimport { onMount } from 'svelte';\nonMount(() => {});\n```",
			{ references }
		);
		expect(html).toContain(
			`<a class="doc-reference" href="${references.svelte.onMount}">onMount</a>`
		);
		expect(html).toContain('class="twoslash-popover"');
		expect(html).not.toContain('twoslash-popup-reference');
		for (const popover of html.matchAll(/<span class="twoslash-popover"[^]*?<\/span><\/span>/g)) {
			expect(popover[0]).not.toContain('doc-reference');
		}
	});

	test('links Svelte scripts and template expressions without linking template locals', async () => {
		const html = await render_content_markdown(
			'component.md',
			[
				'```svelte',
				"<script>import { onMount } from 'svelte'; onMount(() => {});</script>",
				'<p>{onMount.name}</p>',
				'{#each callbacks as onMount}{onMount}{/each}',
				'```'
			].join('\n'),
			{ check: false, references }
		);
		expect(html.match(/class="doc-reference"/g)).toHaveLength(3);
		expect(html.match(/href="\/docs\/svelte\/svelte#onMount"/g)).toHaveLength(3);
	});

	test.each([undefined, 'true', 'false'])(
		'respects link metadata %s independently of copy',
		async (link) => {
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
			expect(html).toContain('copy-to-clipboard');
			expect(html).not.toContain('twoslash-popup-reference');
		}
	);

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

	test('keeps direct links in highlighted and removed lines', async () => {
		const html = await render_content_markdown(
			'diff.md',
			[
				'```ts',
				"import { redirect } from '@sveltejs/kit';",
				"---redirect(302, '/old');---",
				"+++redirect(303, '/new');+++",
				'```'
			].join('\n'),
			{ check: false, references }
		);
		expect(html.match(/class="doc-reference"/g)).toHaveLength(3);
		expect(html).toContain('class="highlight remove"');
		expect(html).toContain('class="highlight add"');
	});
});
