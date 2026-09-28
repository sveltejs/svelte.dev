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
});
