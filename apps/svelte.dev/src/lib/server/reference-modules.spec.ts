import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { generated_type_references, get_reference_module } from './reference-modules.ts';

describe('get_reference_module', () => {
	test.each([
		['docs/svelte/98-reference/20-svelte.md', 'svelte'],
		['./docs/svelte/98-reference/21-svelte-store.md', 'svelte/store'],
		['docs/svelte/98-reference/21-svelte-reactivity-window.md', 'svelte/reactivity/window'],
		['docs/kit/98-reference/10-@sveltejs-kit.md', '@sveltejs/kit'],
		['docs/kit/98-reference/15-@sveltejs-kit-node-polyfills.md', '@sveltejs/kit/node/polyfills'],
		['docs/kit/98-reference/20-$app-navigation.md', '$app/navigation'],
		['docs/kit/98-reference/20-$app-env-private.md', '$app/env/private'],
		['docs/kit/98-reference/25-$env-dynamic-private.md', '$env/dynamic/private'],
		['docs/kit/98-reference/27-$service-worker.md', '$service-worker'],
		['/content/docs/kit/98-reference/20-$app-types.md', '$app/types']
	])('maps %s to %s', (filename, module) => {
		expect(get_reference_module(filename)).toBe(module);
	});

	test.each([
		'docs/kit/98-reference/54-types.md',
		'docs/kit/98-reference/50-configuration.md',
		'docs/kit/98-reference/26-$lib.md',
		'docs/svelte/98-reference/30-compiler-errors.md',
		'docs/svelte/98-reference/21-svelte-unknown.md',
		'docs/kit/98-reference/20-$app-unknown.md',
		'docs/kit/20-core-concepts/20-$app-navigation.md',
		'docs/kit/98-reference/index.md',
		'docs/cli/98-reference/20-svelte.md',
		'tutorial/svelte/98-reference/21-svelte-store.md',
		'blog/21-svelte-store.md',
		'21-svelte-store.md'
	])('does not treat %s as module documentation', (filename) => {
		expect(get_reference_module(filename)).toBeUndefined();
	});

	test.each(['svelte', 'kit'])('recognizes every documented %s module', (topic) => {
		const directory = new URL(`../../../content/docs/${topic}/98-reference/`, import.meta.url);
		let count = 0;

		for (const file of readdirSync(directory)) {
			if (!file.endsWith('.md')) continue;

			const body = readFileSync(new URL(file, directory), 'utf8');
			const title = /^title:\s*(.+)$/m.exec(body)?.[1];
			if (
				!title ||
				!/^(svelte(?:\/|$)|@sveltejs\/kit(?:\/|$)|\$app\/|\$env\/|\$service-worker$)/.test(title)
			) {
				continue;
			}

			expect(get_reference_module(`docs/${topic}/98-reference/${file}`)).toBe(title);
			count++;
		}

		expect(count).toBeGreaterThan(0);
	});
});

describe('generated_type_references', () => {
	test('links generated aliases to Generated types instead of ambient App types', () => {
		const references = generated_type_references();

		for (const name of [
			'RequestHandler',
			'PageLoad',
			'PageServerLoad',
			'PageLoadEvent',
			'PageServerLoadEvent',
			'LayoutLoad',
			'LayoutServerLoad',
			'LayoutLoadEvent',
			'LayoutServerLoadEvent',
			'PageData',
			'LayoutData',
			'ActionData',
			'PageProps',
			'LayoutProps',
			'Actions',
			'EntryGenerator'
		]) {
			expect(references[name]).toBe('/docs/kit/types#Generated-types');
		}

		expect(references.Load).toBeUndefined();
		expect(references.Error).toBeUndefined();
		expect(references.Locals).toBeUndefined();
		expect(references.Platform).toBeUndefined();
	});
});
