import { expect, goto, test } from './fixtures.ts';
import type { Page } from '@playwright/test';

const editor = (page: Page) => page.locator('.editor-container .cm-content');
const preview = (page: Page) => page.locator('section.preview iframe').contentFrame();

test.describe('Svelte tutorial', () => {
	test('shows the exercise alongside an editor and a live preview', async ({ page }) => {
		await goto(page, '/tutorial/svelte/your-first-component');

		await expect(page).toHaveTitle('Introduction / Your first component • Svelte Tutorial');
		await expect(page.locator('.breadcrumbs')).toHaveText(
			/Basic Svelte\s*Introduction\s*Your first component/
		);
		await expect(page.locator('section.content')).toContainText('In Svelte, an application is');
		await expect(editor(page)).toContainText('<h1>Hello world!</h1>');

		// bundling downloads packages from npm
		await expect(preview(page).getByRole('heading', { name: 'Hello world!' })).toBeVisible({
			timeout: 60_000
		});
	});

	test('edits are reflected in the preview', async ({ page }) => {
		await goto(page, '/tutorial/svelte/your-first-component');
		await expect(preview(page).getByRole('heading', { name: 'Hello world!' })).toBeVisible({
			timeout: 60_000
		});

		await editor(page).click();
		await page.keyboard.press('ControlOrMeta+a');
		await page.keyboard.insertText('<h1>Hello Playwright!</h1>');

		await expect(preview(page).getByRole('heading', { name: 'Hello Playwright!' })).toBeVisible();
	});

	test('exercises can be solved and reset', async ({ page }) => {
		await goto(page, '/tutorial/svelte/your-first-component');

		const button = page.getByRole('button', { name: 'solve' });
		await expect(editor(page)).not.toContainText('{name');

		await button.click();
		await expect(editor(page)).toContainText('{name');
		await expect(page.getByRole('button', { name: 'reset' })).toBeVisible();

		await page.getByRole('button', { name: 'reset' }).click();
		await expect(editor(page)).not.toContainText('{name');
		await expect(button).toBeVisible();
	});

	test('completing an exercise by hand marks it as solved', async ({ page }) => {
		await goto(page, '/tutorial/svelte/your-first-component');

		await page.getByRole('button', { name: 'solve' }).click();
		await expect(page.getByRole('button', { name: 'reset' })).toBeVisible();
		const solution = await editor(page).innerText();
		await page.getByRole('button', { name: 'reset' }).click();
		await expect(page.getByRole('button', { name: 'solve' })).toBeVisible();

		await editor(page).click();
		await page.keyboard.press('ControlOrMeta+a');
		await page.keyboard.insertText(solution);

		await expect(page.getByRole('button', { name: 'reset' })).toBeVisible();
	});

	test('the solve button is disabled when there is nothing to solve', async ({ page }) => {
		await goto(page, '/tutorial/svelte/welcome-to-svelte');

		await expect(page.getByRole('button', { name: 'solve' })).toBeDisabled();
	});

	test('arrows step through the exercises', async ({ page }) => {
		await goto(page, '/tutorial/svelte/welcome-to-svelte');

		await expect(page.getByRole('link', { name: 'Previous exercise' })).toHaveCount(0);

		await page.getByRole('link', { name: 'Next exercise' }).click();
		await expect(page).toHaveURL('/tutorial/svelte/your-first-component');
		await expect(editor(page)).toContainText('<h1>Hello world!</h1>');

		await page.getByRole('link', { name: 'Next exercise' }).click();
		await expect(page).toHaveURL('/tutorial/svelte/dynamic-attributes');
		await expect(page.locator('.breadcrumbs')).toContainText('Dynamic attributes');

		await page.getByRole('link', { name: 'Previous exercise' }).click();
		await expect(page).toHaveURL('/tutorial/svelte/your-first-component');
	});

	test('the menu lists every exercise', async ({ page }) => {
		await goto(page, '/tutorial/svelte/welcome-to-svelte');

		await page.locator('summary[aria-label="Menu"]').click();

		const menu = page.locator('.secondary-nav-dropdown');
		await expect(menu.getByRole('link', { name: 'Welcome to Svelte' })).toHaveAttribute(
			'aria-current',
			'page'
		);

		await menu.locator('summary', { hasText: 'Reactivity' }).first().click();
		await menu.getByRole('link', { name: 'Deep state' }).click();

		await expect(page).toHaveURL('/tutorial/svelte/deep-state');
		await expect(page.locator('.breadcrumbs')).toContainText('Deep state');
		await expect(menu).toBeHidden();
	});

	test('files can be selected in the file tree', async ({ page }) => {
		await goto(page, '/tutorial/svelte/nested-components');

		const tree = page.locator('.filetree');
		await expect(tree.getByRole('button', { name: 'App.svelte' })).toBeVisible();
		await expect(editor(page)).toContainText('This is a paragraph.');

		await page.getByRole('button', { name: 'solve' }).click();
		await tree.getByRole('button', { name: 'Nested.svelte' }).click();

		await expect(editor(page)).toContainText('This is another paragraph.');
		await expect(tree.locator('[aria-current="true"]')).toContainText('Nested.svelte');
	});

	test('Vim mode can be toggled', async ({ page }) => {
		await goto(page, '/tutorial/svelte/your-first-component');

		// the option is inside a hover menu
		await page.locator('.dropdown').filter({ hasText: 'Toggle Vim mode' }).hover();
		await page.getByText('Toggle Vim mode').click();
		await expect(page.getByRole('checkbox', { name: 'Toggle Vim mode' })).toBeChecked();

		await expect(page.locator('.editor-container .cm-vimMode')).toBeVisible();
		await expect(page.locator('.editor-container .cm-fat-cursor').first()).toBeAttached();
	});

	test('links in the text navigate between exercises', async ({ page }) => {
		await goto(page, '/tutorial/svelte/welcome-to-svelte');

		await page
			.locator('section.content')
			.getByRole('link', { name: 'Advanced Svelte', exact: true })
			.click();

		await expect(page).toHaveURL('/tutorial/svelte/raw-state');
	});
});

test.describe('SvelteKit tutorial', () => {
	test('is served with cross-origin isolation, which WebContainers require', async ({ page }) => {
		const response = await page.goto('/tutorial/kit/introducing-sveltekit');
		const headers = response!.headers();

		expect(headers['cross-origin-opener-policy']).toBe('same-origin');
		expect(headers['cross-origin-embedder-policy']).toBe('require-corp');
		expect(await page.evaluate(() => crossOriginIsolated)).toBe(true);

		await expect(page).toHaveTitle('Introduction / What is SvelteKit? • Svelte Tutorial');
		await expect(page.locator('section.content')).toContainText('SvelteKit');
	});

	test('shows the project files and a browser-like preview', async ({ page }) => {
		await goto(page, '/tutorial/kit/pages');

		await expect(
			page.locator('.filetree').getByRole('button', { name: '+page.svelte' })
		).toBeVisible();
		await expect(editor(page)).toContainText('<h1>home</h1>');
		await expect(page.getByRole('textbox', { name: 'URL' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'reload' })).toBeVisible();
	});

	test('moving between the Svelte and SvelteKit tutorials reloads the page', async ({ page }) => {
		await goto(page, '/tutorial/svelte/welcome-to-svelte');
		await page.evaluate(() => ((window as any).same_document = true));

		await page
			.locator('section.content')
			.getByRole('link', { name: 'Basic SvelteKit', exact: true })
			.click();

		await expect(page).toHaveURL('/tutorial/kit/introducing-sveltekit');
		await expect(page.locator('section.content')).toContainText('SvelteKit');
		expect(await page.evaluate(() => (window as any).same_document)).toBeUndefined();
		expect(await page.evaluate(() => crossOriginIsolated)).toBe(true);
	});
});
