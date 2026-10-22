import { describe, expect, test } from 'vitest';
import { render_content } from './renderer.ts';

describe('render_content', () => {
	test('transforms Markdown links when given an origin', async () => {
		const html = await render_content(
			'test.md',
			'[internal](https://svelte.dev/docs/kit) [external](https://example.com/docs)',
			{ check: false, origin: 'https://preview.example.com' }
		);

		expect(html).toContain('href="https://preview.example.com/docs/kit"');
		expect(html).toContain('href="https://example.com/docs"');
	});

	test('keeps canonical links without an origin', async () => {
		const html = await render_content('test.md', '[docs](https://svelte.dev/docs/kit)', {
			check: false
		});

		expect(html).toContain('href="https://svelte.dev/docs/kit"');
	});
});
