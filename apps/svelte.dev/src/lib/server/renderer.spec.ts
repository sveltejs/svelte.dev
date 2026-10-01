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

	test.each([
		[
			'Svelte APIs',
			'import { onMount } from "svelte";\nonMount(() => {});',
			'<p>Hello</p>',
			'function'
		],
		['Kit state', 'import { page } from "$app/state";', '<p>{page.url.pathname}</p>', 'pathname'],
		[
			'Kit environment',
			'import { browser } from "$app/environment";',
			'<p>{browser}</p>',
			'boolean'
		],
		[
			'environment variables',
			'import { PUBLIC_BASE_URL } from "$env/static/public";',
			'<p>{PUBLIC_BASE_URL}</p>',
			'string'
		],
		[
			'route types',
			'import type { PageLoad } from "./$types";\nlet load: PageLoad;',
			'<p>Hello</p>',
			'PageLoad'
		],
		[
			'page props',
			'import type { PageProps } from "./$types";\nlet { data }: PageProps = $props();',
			'<p>{data.title}</p>',
			'PageData'
		],
		[
			'layout props',
			'import type { LayoutProps } from "./$types";\nlet { children }: LayoutProps = $props();',
			'{@render children()}',
			'Snippet'
		]
	])('resolves %s in Svelte components', async (_, script, markup, type) => {
		const html = await render_content(
			'types.md',
			`\`\`\`svelte\n<script lang="ts">\n${script}\n</script>\n${markup}\n\`\`\``
		);
		expect(html).toContain('twoslash-popover-type');
		expect(html).toContain(type);
		expect(html).not.toContain('@filename');
		expect(html).not.toContain('reference types');
		expect(html).not.toContain('__sveltets');
	});

	test('keeps diagnostics strict for incomplete synced examples', async () => {
		await expect(
			render_content(
				'incomplete.md',
				'\`\`\`svelte\n<button onclick={todo.reset}>reset</button>\n\`\`\`'
			)
		).rejects.toThrow('Error compiling snippet in incomplete.md');
	});
});
