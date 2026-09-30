import * as markdown from '@sveltejs/site-kit/markdown';
import { afterEach, describe, expect, test, vi } from 'vitest';
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
	afterEach(() => vi.restoreAllMocks());

	test.each([
		['docs/svelte/98-reference/21-svelte-action.md', 'svelte/action'],
		['docs/svelte/98-reference/21-svelte-reactivity-window.md', 'svelte/reactivity/window'],
		['docs/kit/98-reference/10-@sveltejs-kit.md', '@sveltejs/kit'],
		['docs/kit/98-reference/20-$app-navigation.md', '$app/navigation']
	])('passes the module documented by %s to the Markdown renderer', async (filename, module) => {
		const render_markdown = vi.spyOn(markdown, 'render_content_markdown').mockResolvedValue('');
		const body = '```dts\nfunction example(): SharedType;\n```';
		const references = {
			[module]: { SharedType: '/docs/correct#SharedType' },
			'unrelated/module': { SharedType: '/docs/wrong#SharedType' }
		};

		await render_content(filename, body, { check: false, references });

		expect(render_markdown).toHaveBeenCalledWith(
			filename,
			body,
			expect.objectContaining({ check: false, references, referenceModule: module }),
			expect.any(Function)
		);
	});

	test('does not infer a module for concept pages', async () => {
		const render_markdown = vi.spyOn(markdown, 'render_content_markdown').mockResolvedValue('');
		const filename = 'docs/kit/98-reference/54-types.md';
		const body = '```dts\nfunction example(): PageData;\n```';

		await render_content(filename, body, {
			check: false,
			references: { './$types': { PageData: '/docs/kit/types#Generated-types' } }
		});

		expect(render_markdown).toHaveBeenCalledWith(
			filename,
			body,
			expect.objectContaining({ referenceModule: undefined }),
			expect.any(Function)
		);
	});

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
