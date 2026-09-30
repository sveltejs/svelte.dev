import { create_index } from '@sveltejs/site-kit/server/content';
import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { get_reference_module } from './reference-modules.ts';

const sections = [{ title: 'FutureExport', slug: 'FutureExport', subsections: [] }];

describe('get_reference_module', () => {
	test.each(['svelte/future', '@another/package/future', '$app/future'])(
		'discovers %s from metadata rather than a module list or filename',
		(title) => {
			expect(
				get_reference_module({
					file: 'docs/kit/98-reference/99-api.md',
					metadata: { title },
					sections
				})
			).toBe(title);
		}
	);

	test('does not use API metadata outside reference pages', () => {
		expect(
			get_reference_module({
				file: 'tutorial/svelte/98-reference/21-svelte-store.md',
				metadata: { title: 'svelte/store' },
				sections
			})
		).toBeUndefined();
	});

	test.each([
		['kit', '10-@sveltejs-kit.md', '@sveltejs/kit'],
		['kit', '26-$lib.md', undefined],
		['kit', '50-configuration.md', undefined],
		['svelte', '21-svelte-reactivity-window.md', 'svelte/reactivity/window']
	])('classifies the real %s/%s page', async (topic, file, expected) => {
		const filename = `docs/${topic}/98-reference/${file}`;
		const index = await create_index(
			{ [`./${filename}`]: filename },
			{},
			(asset) =>
				new Response(readFileSync(new URL(`../../../content/${asset}`, import.meta.url), 'utf8'))
		);
		expect(get_reference_module(Object.values(index)[0])).toBe(expected);
	});
});
