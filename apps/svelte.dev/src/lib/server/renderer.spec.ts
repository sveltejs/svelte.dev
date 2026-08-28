import { describe, expect, test } from 'vitest';
import { render_content, replace_canonical_origin } from './renderer.ts';

describe('replace_canonical_origin', () => {
	test('replaces only the canonical origin and preserves the URL suffix', () => {
		expect(
			replace_canonical_origin(
				'https://svelte.dev/docs/kit?mode=advanced#configuration',
				'http://localhost:5173'
			)
		).toBe('http://localhost:5173/docs/kit?mode=advanced#configuration');
	});

	test.each([
		'/docs/kit',
		'https://example.com/docs/kit',
		'https://svelte.dev.example.com/docs/kit'
	])('leaves %s unchanged', (href) => {
		expect(replace_canonical_origin(href, 'https://preview.example.com')).toBe(href);
	});
});

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
