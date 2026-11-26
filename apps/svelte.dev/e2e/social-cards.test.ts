import { expect, test } from './fixtures.ts';

const cards = [
	{ name: 'docs', page: '/docs/svelte/overview' },
	{ name: 'docs-with-symbols', page: '/docs/svelte/if' },
	{ name: 'docs-kit', page: '/docs/kit/load' },
	{ name: 'blog', page: '/blog/runes' }
];

/** reads the size from the IHDR chunk that starts every PNG */
function size(png: Buffer) {
	return { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
}

for (const { name, page: path } of cards) {
	test(`${path} has a social card`, async ({ page, request }) => {
		await page.goto(path);

		const card = `https://svelte.dev${path}/card.png`;
		await expect(page.locator('meta[name="og:image"]')).toHaveAttribute('content', card);
		await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', card);
		await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
			'content',
			'summary_large_image'
		);

		const response = await request.get(`${path}/card.png`);
		expect(response.status()).toBe(200);
		expect(response.headers()['content-type']).toBe('image/png');

		const png = await response.body();
		expect(size(png)).toEqual({ width: 1200, height: 630 });
		expect(png).toMatchSnapshot(`${name}-card.png`, { maxDiffPixelRatio: 0.01 });
	});
}

test('pages without a card of their own use the default image', async ({ page }) => {
	await page.goto('/packages');

	await expect(page.locator('meta[name="og:image"]')).toHaveAttribute(
		'content',
		'https://svelte.dev/images/twitter-thumbnail.jpg'
	);
	await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary');

	const response = await page.request.get('/images/twitter-thumbnail.jpg');
	expect(response.status()).toBe(200);
});

test('unknown pages have no card', async ({ request }) => {
	for (const path of ['/docs/svelte/does-not-exist/card.png', '/blog/does-not-exist/card.png']) {
		const response = await request.get(path);

		expect(response.status(), path).toBe(404);
	}
});
