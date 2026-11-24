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
});
