import { describe, expect, test } from 'vitest';
import { render_content } from './renderer.ts';

describe('render_content', () => {
	test('strips the canonical origin from Markdown links', async () => {
		const html = await render_content(
			'test.md',
			'[internal](https://svelte.dev/docs/kit) [external](https://example.com/docs)',
			{ check: false }
		);

		expect(html).toContain('href="/docs/kit"');
		expect(html).toContain('href="https://example.com/docs"');
	});
});
