import type { APIResponse } from '@playwright/test';
import { expect, test } from './fixtures.ts';

/** prerendered redirects are meta refresh pages locally and real redirects in production */
async function destination(response: APIResponse) {
	if (response.status() >= 300 && response.status() < 400) {
		return response.headers().location;
	}

	const match = /<meta http-equiv="refresh" content="0;url=([^"]+)">/.exec(await response.text());
	return match?.[1].replaceAll('&amp;', '&');
}

const redirects: Array<[from: string, to: string]> = [
	['/docs/svelte', '/docs/svelte/overview'],
	['/docs/kit', '/docs/kit/introduction'],
	['/docs/introduction', '/docs/svelte/overview'],
	['/docs/svelte-store', '/docs/svelte/svelte-store'],
	['/docs/kit/configuration', '/docs/kit/@sveltejs-kit-vite'],
	['/docs/mcp/overview', '/docs/ai/overview'],
	['/docs/ai/plugin', '/docs/ai/claude-plugin'],
	['/docs/cli/mcp', '/docs/cli/ai-tools'],
	['/faq', '/docs/svelte/faq'],
	['/blog/the-easiest-way-to-get-started', '/docs'],
	['/tutorial', '/tutorial/svelte/welcome-to-svelte'],
	['/tutorial/reactive-assignments', '/tutorial/svelte/state'],
	['/tutorial/kit/app-store', '/tutorial/kit/app-state'],
	['/playground', '/playground/hello-world?show=input'],
	['/playground?example=each-blocks', '/playground/each-blocks'],
	['/playground?version=5.0.0', '/playground/hello-world?version=5.0.0&show=input'],
	['/playground?version=2.0.0', 'https://v2.svelte.dev/repl?version=2.0.0'],
	['/playground/embed', '/playground/hello-world/embed'],
	['/repl', '/playground'],
	['/repl/hello-world', '/playground/hello-world'],
	['/examples/hello-world', '/playground/hello-world'],
	['/e/state_unsafe_mutation', '/docs/svelte/runtime-errors#Client-errors-state_unsafe_mutation'],
	['/chat', 'https://discord.gg/svelte']
];

for (const [from, to] of redirects) {
	test(`${from} redirects to ${to}`, async ({ request, baseURL }) => {
		const response = await request.get(from, { maxRedirects: 0 });

		const to_url = await destination(response);
		expect(to_url, 'should redirect').toBeTruthy();

		// an empty query string is harmless
		const location = new URL(to_url!, baseURL).href.replace(/\?$/, '');
		expect(location).toBe(new URL(to, baseURL).href);
	});
}

test('/roadmap redirects to an external document', async ({ request }) => {
	const response = await request.get('/roadmap', { maxRedirects: 0 });

	expect(await destination(response)).toMatch(/^https:\/\//);
});

test('redirected pages render their destination', async ({ page }) => {
	await page.goto('/docs/introduction');

	await expect(page).toHaveURL('/docs/svelte/overview');
	await expect(page.getByRole('heading', { level: 1, name: 'Overview' })).toBeVisible();
});
