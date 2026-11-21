import { expect, goto, main, primary_nav, test } from './fixtures.ts';
import type { Page } from '@playwright/test';

const dialog = (page: Page) => page.locator('.search-box');
const input = (page: Page) => dialog(page).getByRole('textbox', { name: 'Search' });
const results = (page: Page) => dialog(page).locator('.results-container a');

test.describe('search dialog', () => {
	test.beforeEach(async ({ page }) => {
		await goto(page, '/');
	});

	test('opens with the keyboard shortcut and closes with Escape', async ({ page }) => {
		await page.keyboard.press('ControlOrMeta+k');
		await expect(input(page)).toBeFocused();
		await expect(dialog(page)).toContainText('No recent searches');

		await page.keyboard.press('Escape');
		await expect(dialog(page)).toBeHidden();

		await page.keyboard.press('ControlOrMeta+k');
		await expect(dialog(page)).toBeVisible();
		await page.keyboard.press('ControlOrMeta+k');
		await expect(dialog(page)).toBeHidden();
	});

	test('opens from the search box in the nav', async ({ page }) => {
		await primary_nav(page).getByRole('searchbox', { name: 'Search' }).click();
		await expect(input(page)).toBeFocused();

		await dialog(page).getByRole('button', { name: 'Close' }).click();
		await expect(dialog(page)).toBeHidden();
	});

	test('finds documentation as you type', async ({ page }) => {
		await page.keyboard.press('ControlOrMeta+k');
		await input(page).fill('$derived');

		await expect(results(page).first()).toBeVisible();
		await expect(results(page).first()).toHaveAttribute('href', /^\/docs\/svelte\/\$derived/);
		await expect(dialog(page).locator('mark').first()).toHaveText(/\$derived/i);

		await dialog(page).getByRole('button', { name: 'Clear' }).click();
		await expect(input(page)).toHaveValue('');
		await expect(results(page)).toHaveCount(0);
	});

	test('says when nothing matches', async ({ page }) => {
		await page.keyboard.press('ControlOrMeta+k');
		await input(page).fill('zzzzqqqqxxxx');

		await expect(dialog(page)).toContainText('No results');
	});

	test('Enter opens the first result', async ({ page }) => {
		await page.keyboard.press('ControlOrMeta+k');
		await input(page).fill('$effect.pre');
		await expect(results(page).first()).toBeVisible();

		const href = await results(page).first().getAttribute('href');
		await input(page).press('Enter');

		await expect(page).toHaveURL(href!);
		await expect(dialog(page)).toBeHidden();
	});

	test('results can be navigated with the arrow keys', async ({ page }) => {
		await page.keyboard.press('ControlOrMeta+k');
		await input(page).fill('transition');
		await expect(results(page).nth(1)).toBeVisible();

		await page.keyboard.press('ArrowDown');
		await expect(results(page).first()).toBeFocused();
		await page.keyboard.press('ArrowDown');
		await expect(results(page).nth(1)).toBeFocused();
		await page.keyboard.press('ArrowUp');
		await expect(results(page).first()).toBeFocused();

		const href = await results(page).first().getAttribute('href');
		await page.keyboard.press('Enter');
		await expect(page).toHaveURL(href!);
	});

	test('remembers recent searches, which can be removed', async ({ page }) => {
		await page.keyboard.press('ControlOrMeta+k');
		await input(page).fill('snippet');
		const href = await results(page).first().getAttribute('href');
		await results(page).first().click();
		await expect(page).toHaveURL(href!);
		await expect(dialog(page)).toBeHidden();

		await page.keyboard.press('ControlOrMeta+k');
		await expect(dialog(page)).toContainText('Recent searches');

		const recent = dialog(page).locator('.recent li');
		await expect(recent).toHaveCount(1);

		await recent.getByRole('button', { name: 'Delete' }).click();
		await expect(recent).toHaveCount(0);
		await expect(dialog(page)).toContainText('No recent searches');
	});
});

test.describe('search page', () => {
	test('shows results for the query', async ({ page }) => {
		await page.goto('/search?q=%24state');

		await expect(page).toHaveTitle('Search • Svelte');

		await expect(main(page).getByRole('searchbox', { name: 'Search' })).toHaveValue('$state');
		await expect(main(page).locator('a[href^="/docs/svelte/$state"]').first()).toBeVisible();
	});

	test('searches again when the form is submitted', async ({ page }) => {
		await goto(page, '/search?q=%24state');

		const search = main(page).getByRole('searchbox', { name: 'Search' });
		await search.fill('load');
		await search.press('Enter');

		await expect(page).toHaveURL('/search?q=load');
		await expect(main(page).locator('a[href^="/docs/kit/load"]').first()).toBeVisible();
	});

	test('says when nothing matches', async ({ page }) => {
		await page.goto('/search?q=zzzzqqqqxxxx');

		await expect(main(page)).toContainText('No results');
	});

	test('works without JavaScript', async ({ browser }) => {
		const context = await browser.newContext({ javaScriptEnabled: false });
		const page = await context.newPage();

		await page.goto('/');
		const search = page.getByRole('navigation', { name: 'Primary' }).getByRole('searchbox');
		await search.fill('snippet');
		await search.press('Enter');

		await expect(page).toHaveURL('/search?q=snippet');
		await expect(main(page).locator('a[href^="/docs/svelte/snippet"]').first()).toBeVisible();

		await context.close();
	});
});
