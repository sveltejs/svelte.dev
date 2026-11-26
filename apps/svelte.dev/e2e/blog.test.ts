import { expect, goto, main, test } from './fixtures.ts';

test.describe('blog', () => {
	test('lists posts, newest first', async ({ page }) => {
		await page.goto('/blog');

		await expect(page).toHaveTitle('Blog • Svelte');
		await expect(page.locator('link[type="application/rss+xml"]')).toHaveAttribute(
			'href',
			'https://svelte.dev/blog/rss.xml'
		);

		const dates = await page
			.locator('article[data-pubdate]')
			.evaluateAll((articles) => articles.map((article) => article.getAttribute('data-pubdate')!));

		expect(dates.length).toBeGreaterThan(10);
		expect(dates).toEqual([...dates].sort().reverse());
	});

	test('separates monthly updates from featured posts', async ({ page }) => {
		await page.goto('/blog');

		const feed = page.locator('.feed');
		await expect(feed.getByRole('link').first()).toBeVisible();
		await expect(feed.getByRole('link').first()).toHaveAttribute('href', /^\/blog\/whats-new/);

		const hidden = page.locator('.featured article:not(.feature)').first();
		await expect(hidden).toBeHidden();
	});

	test('opens a post', async ({ page }) => {
		await goto(page, '/blog');

		const top = page.locator('article.top');
		const title = (await top.getByRole('heading').innerText()).trim();
		await top.getByRole('link').first().click();

		await expect(page).toHaveURL(/\/blog\/[\w-]+$/);
		await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
		await expect(page).toHaveTitle(new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
	});

	test('posts have a byline, content and a social card', async ({ page }) => {
		await page.goto('/blog/runes');

		await expect(page.getByRole('heading', { level: 1, name: 'Introducing runes' })).toBeVisible();
		await expect(page.locator('.byline')).toContainText('The Svelte team');
		await expect(page.locator('time')).toHaveAttribute('datetime', '2023-09-20');
		await expect(page.locator('meta[name="og:image"]')).toHaveAttribute(
			'content',
			'https://svelte.dev/blog/runes/card.png'
		);
	});
});
