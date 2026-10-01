import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, expect, test, vi } from 'vitest';
import { routes } from '@vercel/config/v1';
import { create_llms_canonical } from './vercel.ts';

afterEach(() => {
	vi.unstubAllEnvs();
	vi.resetModules();
});

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
		routes.header('/docs/kit/remote-functions/llms.txt', [
			{
				key: 'Link',
				value: '<https://svelte.dev/docs/kit/remote-functions>; rel="canonical"'
			}
		]),
		routes.header('/docs/svelte/getting-started/llms.txt', [
			{
				key: 'Link',
				value: '<https://svelte.dev/docs/svelte/getting-started>; rel="canonical"'
			}
		])
	]);
});

test('preserves existing Vercel configuration and generates unique rules within the limit', async () => {
	vi.stubEnv('VERCEL_GIT_COMMIT_REF', 'main');
	vi.resetModules();
	const { config } = await import('./vercel.ts');

	expect(config.rewrites).toEqual([
		routes.rewrite(
			'/opencode/schema.json',
			'https://raw.githubusercontent.com/sveltejs/ai-tools/refs/heads/main/packages/opencode/schema.json'
		)
	]);

	expect(config.git).toEqual({ deploymentEnabled: { next: false } });

	const canonical_headers = config.headers!.slice(2);
	expect(canonical_headers.length).toBeGreaterThan(0);
	expect(config.headers!.length).toBeLessThanOrEqual(2048);
	expect(new Set(canonical_headers.map((header) => header.source)).size).toBe(
		canonical_headers.length
	);
	expect(canonical_headers.some((header) => header.source === '/docs/svelte/llms.txt')).toBe(false);
});

test.each(['main', 'feature'])(
	'only emits nonempty header rules on %s and limits noindex to previews',
	async (branch) => {
		vi.stubEnv('VERCEL_GIT_COMMIT_REF', branch);
		vi.resetModules();
		const { config } = await import('./vercel.ts');

		// Vercel converts these arrays to route header objects, which must have at
		// least one property. An empty production rule fails patchBuild validation.
		for (const rule of config.headers!) {
			expect(rule.headers.length).toBeGreaterThan(0);
		}

		const noindex = config.headers!.filter((rule) =>
			rule.headers.some((header) => header.key === 'X-Robots-Tag')
		);
		expect(noindex).toEqual(
			branch === 'main' ? [] : [routes.header('/(.*)', [{ key: 'X-Robots-Tag', value: 'noindex' }])]
		);
	}
);

test('disables next deployments only when the current branch is main', async () => {
	vi.stubEnv('VERCEL_GIT_COMMIT_REF', 'main');
	vi.resetModules();
	expect((await import('./vercel.ts')).config.git).toEqual({ deploymentEnabled: { next: false } });

	vi.stubEnv('VERCEL_GIT_COMMIT_REF', 'feature');
	vi.resetModules();
	expect((await import('./vercel.ts')).config).not.toHaveProperty('git');
});
