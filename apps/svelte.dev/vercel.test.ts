import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, test } from 'vitest';
import { config, create_llms_canonical } from './vercel.ts';

test('generates canonical headers for per-document llms routes', () => {
	const directory = mkdtempSync(join(tmpdir(), 'svelte-dev-vercel-'));
	mkdirSync(join(directory, 'svelte', '01-introduction'), { recursive: true });
	mkdirSync(join(directory, 'kit', '20-core-concepts'), { recursive: true });
	mkdirSync(join(directory, 'kit', '20-core-concepts', '.generated'), { recursive: true });
	writeFileSync(join(directory, 'svelte', '01-introduction', '02-getting-started.md'), '');
	writeFileSync(join(directory, 'kit', '20-core-concepts', '60-remote-functions.md'), '');
	writeFileSync(join(directory, 'svelte', '01-introduction', 'index.md'), '');
	writeFileSync(join(directory, 'kit', '20-core-concepts', '.generated', 'reference.md'), '');

	expect(create_llms_canonical(directory)).toEqual([
		{
			source: '/docs/kit/remote-functions/llms.txt',
			headers: [
				{
					key: 'Link',
					value: '<https://svelte.dev/docs/kit/remote-functions>; rel="canonical"'
				}
			]
		},
		{
			source: '/docs/svelte/getting-started/llms.txt',
			headers: [
				{
					key: 'Link',
					value: '<https://svelte.dev/docs/svelte/getting-started>; rel="canonical"'
				}
			]
		}
	]);
});

test('preserves existing Vercel configuration and generates unique rules within the limit', () => {
	expect(config.rewrites).toEqual([
		{
			source: '/opencode/schema.json',
			destination:
				'https://raw.githubusercontent.com/sveltejs/ai-tools/refs/heads/main/packages/opencode/schema.json'
		}
	]);
	expect(config.git).toEqual({ deploymentEnabled: { next: false } });

	const canonical_headers = config.headers.slice(2);
	expect(canonical_headers.length).toBeGreaterThan(0);
	expect(config.headers.length).toBeLessThanOrEqual(2048);
	expect(new Set(canonical_headers.map((header) => header.source)).size).toBe(
		canonical_headers.length
	);
	expect(canonical_headers.some((header) => header.source === '/docs/svelte/llms.txt')).toBe(false);
});
