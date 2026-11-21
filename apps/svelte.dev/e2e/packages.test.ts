import { expect, goto, test } from './fixtures.ts';

test.describe('packages', () => {
	test('groups packages into categories', async ({ page }) => {
		await page.goto('/packages');

		await expect(page).toHaveTitle('Packages • Svelte');
		await expect(page.getByRole('heading', { level: 1, name: 'Packages' })).toBeVisible();

		for (const name of ['Svelte CLI add-ons', 'Component libraries']) {
			await expect(page.getByRole('heading', { level: 2, name })).toBeVisible();
		}

		const card = page.getByRole('article').filter({ hasText: 'shadcn-svelte' }).first();
		await expect(card.getByRole('link', { name: 'View project homepage' })).toHaveAttribute(
			'href',
			/^https:\/\//
		);
		await expect(card.getByRole('link', { name: 'View on npm' })).toHaveAttribute(
			'href',
			'https://npmjs.org/package/shadcn-svelte'
		);
		await expect(card.getByRole('link', { name: 'View on GitHub' })).toHaveAttribute(
			'href',
			/^https:\/\/github\.com\//
		);
	});

	test('add-ons link to their docs', async ({ page }) => {
		await goto(page, '/packages');

		await page
			.getByRole('article')
			.filter({ hasText: 'tailwind' })
			.first()
			.getByRole('link')
			.first()
			.click();

		await expect(page).toHaveURL('/docs/cli/tailwind');
	});

	test('categories can be expanded to show every package', async ({ page }) => {
		await goto(page, '/packages');

		const details = page.locator('details').first();
		const hidden = details.getByRole('article').first();
		await expect(hidden).toBeHidden();

		await details.locator('summary').click();
		await expect(hidden).toBeVisible();

		await details.locator('summary').click();
		await expect(hidden).toBeHidden();
	});

	test('linking to a category expands it', async ({ page }) => {
		await page.goto('/packages#component-libraries');

		const heading = page.locator('#component-libraries');
		await expect(heading).toBeInViewport();

		const section = page.locator('section.category').filter({ has: heading });
		await expect(section.locator('details')).toHaveAttribute('open');
	});
});
