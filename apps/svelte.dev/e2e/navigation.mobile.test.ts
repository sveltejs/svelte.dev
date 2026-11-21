import { expect, goto, primary_nav, test } from './fixtures.ts';

test.describe('mobile navigation', () => {
	test('the menu links to each section of the site', async ({ page }) => {
		await goto(page, '/');

		const nav = primary_nav(page);
		await expect(nav.getByRole('link', { name: 'Docs', exact: true })).toBeHidden();

		const toggle = nav.getByRole('button', { name: 'Toggle menu' });
		await toggle.click();
		await expect(toggle).toHaveAttribute('aria-expanded', 'true');

		const menu = page.locator('.mobile-main-menu');
		for (const name of ['Docs', 'Playground', 'Tutorial', 'Packages', 'Blog']) {
			await expect(menu.getByRole('link', { name, exact: true })).toBeVisible();
		}

		await menu.getByRole('link', { name: 'Blog', exact: true }).click();

		await expect(page).toHaveURL('/blog');
		await expect(menu).toBeHidden();
		await expect(nav.locator('.current-section')).toHaveText('Blog');
	});

	test('the menu closes with Escape', async ({ page }) => {
		await goto(page, '/');

		const toggle = primary_nav(page).getByRole('button', { name: 'Toggle menu' });
		await toggle.click();
		await expect(page.locator('.mobile-main-menu')).toBeVisible();

		await page.keyboard.press('Escape');

		await expect(page.locator('.mobile-main-menu')).toBeHidden();
		await expect(toggle).toHaveAttribute('aria-expanded', 'false');
		await expect(toggle).toBeFocused();
	});

	test('on a docs page, the menu shows the pages of the current topic', async ({ page }) => {
		await goto(page, '/docs/svelte/overview');

		await primary_nav(page).getByRole('button', { name: 'Toggle menu' }).click();

		const menu = page.locator('.mobile-main-menu');
		await expect(menu.locator('a[href="/docs/svelte/overview"]')).toHaveAttribute(
			'aria-current',
			'page'
		);

		await menu.getByRole('link', { name: 'Getting started' }).click();

		await expect(page).toHaveURL('/docs/svelte/getting-started');
		await expect(page.getByRole('heading', { level: 1, name: 'Getting started' })).toBeVisible();
	});

	test('search opens from the nav', async ({ page }) => {
		await goto(page, '/');

		await primary_nav(page).getByRole('button', { name: 'Search' }).click();

		const dialog = page.locator('.search-box');
		await dialog.getByRole('textbox', { name: 'Search' }).fill('$state');

		await expect(dialog.locator('.results-container a').first()).toBeVisible();
	});

	test('the theme can be toggled', async ({ page }) => {
		await page.emulateMedia({ colorScheme: 'light' });
		await goto(page, '/');

		await page.locator('.mobile-menu').getByRole('button', { name: 'Toggle dark mode' }).click();

		await expect(page.locator('html')).toHaveClass(/\bdark\b/);
	});
});

test.describe('mobile docs', () => {
	test('"on this page" is a collapsible menu', async ({ page }) => {
		await goto(page, '/docs/svelte/$state');

		const on_this_page = page.locator('.on-this-page');
		const link = on_this_page.getByRole('link', { name: '$state.raw' });
		await expect(link).toBeHidden();

		await on_this_page.locator('label').click();
		await link.click();

		await expect(page).toHaveURL('/docs/svelte/$state#$state.raw');
	});

	test('pages do not scroll sideways', async ({ page }) => {
		for (const path of ['/', '/docs/svelte/overview', '/blog', '/packages']) {
			await page.goto(path);

			const overflow = await page.evaluate(
				() => document.documentElement.scrollWidth - document.documentElement.clientWidth
			);
			expect(overflow, path).toBeLessThanOrEqual(0);
		}
	});
});

test.describe('mobile tutorial', () => {
	test('toggles between the text and the editor', async ({ page }) => {
		await goto(page, '/tutorial/svelte/your-first-component');

		const text = page.locator('section.content');
		const editor = page.locator('.editor-container .cm-content');
		await expect(text).toBeInViewport();
		await expect(editor).not.toBeInViewport();

		await page.locator('.screen-toggle label').click();

		await expect(editor).toBeInViewport();
		await expect(text).not.toBeInViewport();
	});
});

test.describe('mobile playground', () => {
	test('toggles between the input and the output', async ({ page }) => {
		await goto(page, '/playground/hello-world?show=input');

		const editor = page.locator('.repl-outer .cm-content').first();
		await expect(editor).toBeInViewport();

		await page.locator('.repl-outer .input-output-toggle').click();

		await expect(page.locator('.repl-outer iframe').first()).toBeInViewport();
		await expect(editor).not.toBeInViewport();
	});
});
