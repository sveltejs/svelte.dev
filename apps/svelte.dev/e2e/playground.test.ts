import { expect, goto, test } from './fixtures.ts';
import type { Page } from '@playwright/test';

const editor = (page: Page) => page.locator('.repl-outer .cm-content').first();
const result = (page: Page) => page.locator('.repl-outer iframe').first().contentFrame();
const name = (page: Page) => page.locator('.repl-outer input').first();

/** replaces the contents of the editor */
async function type(page: Page, code: string) {
	await editor(page).click();
	await page.keyboard.press('ControlOrMeta+a');
	await page.keyboard.insertText(code);
}

test.describe('playground', () => {
	test('runs the example in a sandbox', async ({ page }) => {
		await goto(page, '/playground/hello-world');

		await expect(page).toHaveTitle('Hello world • Playground • Svelte');
		await expect(name(page)).toHaveValue('Hello world');
		await expect(editor(page)).toContainText('<h1>Hello {name}!</h1>');

		// bundling downloads packages from npm
		const app = result(page);
		await expect(app.getByRole('heading', { name: 'Hello world!' })).toBeVisible({
			timeout: 60_000
		});

		await app.getByRole('textbox').fill('Playwright');
		await expect(app.getByRole('heading', { name: 'Hello Playwright!' })).toBeVisible();
		await app.getByRole('button', { name: 'clicks: 0' }).click();
		await expect(app.getByRole('button', { name: 'clicks: 1' })).toBeVisible();
	});

	test('re-runs the app when the code changes', async ({ page }) => {
		await goto(page, '/playground/hello-world');
		await expect(result(page).getByRole('heading', { name: 'Hello world!' })).toBeVisible({
			timeout: 60_000
		});

		await type(page, '<h1>Edited</h1>');

		await expect(result(page).getByRole('heading', { name: 'Edited' })).toBeVisible();
		await expect(name(page)).toHaveValue('Hello world (edited)');
		await expect(page).toHaveTitle('Hello world (edited) • Playground • Svelte');
	});

	test('edits are stored in the URL, so that they can be shared', async ({ page, context }) => {
		await goto(page, '/playground/hello-world');
		await expect(editor(page)).toContainText('Hello');

		await type(page, '<h1>Shared</h1>');
		// the hash is written when focus leaves the editor
		await name(page).focus();
		await expect(page).toHaveURL(/\/playground\/hello-world.*#H4sIA/);

		const other = await context.newPage();
		await other.goto(page.url());

		await expect(editor(other)).toContainText('<h1>Shared</h1>');
		await expect(name(other)).toHaveValue('Hello world (edited)');
		await expect(result(other).getByRole('heading', { name: 'Shared' })).toBeVisible({
			timeout: 60_000
		});
	});

	test('unsaved edits survive a reload', async ({ page }) => {
		await goto(page, '/playground/hello-world');
		await expect(editor(page)).toContainText('Hello');

		await type(page, '<h1>Reloaded</h1>');
		await page.reload();

		await expect(editor(page)).toContainText('<h1>Reloaded</h1>');
	});

	test('shows compiler errors', async ({ page }) => {
		await goto(page, '/playground/hello-world');
		await expect(editor(page)).toContainText('Hello');

		await type(page, '{#if}');

		// compiling downloads the compiler from npm
		await expect(page.getByRole('heading', { name: 'Error compiling App.svelte' })).toBeVisible({
			timeout: 60_000
		});
		await expect(page.locator('.repl-outer .error-overlay')).toContainText('line 1 column 4');
	});

	test('shows the compiled JS, CSS and AST', async ({ page }) => {
		await goto(page, '/playground/hello-world');
		await type(page, '<h1>Hi</h1>\n\n<style>\n\th1 { color: rebeccapurple }\n</style>');

		const output = page.locator('.repl-outer .cm-content');

		await page.getByRole('button', { name: 'JS output' }).click();
		await expect(page.getByRole('button', { name: 'JS output' })).toHaveAttribute(
			'aria-current',
			'true'
		);
		// compiling downloads the compiler from npm
		await expect(output.filter({ hasText: 'svelte/internal/client' })).toBeVisible({
			timeout: 60_000
		});

		await page.getByRole('button', { name: 'CSS output' }).click();
		await expect(output.filter({ hasText: /h1\.svelte-\w+/ })).toBeVisible();

		await page.getByRole('button', { name: 'AST output' }).click();
		await expect(page.locator('.repl-outer .ast-view')).toContainText('Root');

		await page.getByRole('button', { name: 'Result' }).click();
		await expect(page.getByRole('button', { name: 'Result' })).toHaveAttribute(
			'aria-current',
			'true'
		);
	});

	test('logs appear in the console', async ({ page }) => {
		await goto(page, '/playground/hello-world');
		await type(page, `<script>\n\tconsole.log('logged from the app');\n</script>`);

		await page.getByRole('button', { name: 'Console' }).click();

		await expect(
			page.locator('.repl-outer .log').filter({ hasText: 'logged from the app' })
		).toBeVisible({
			timeout: 60_000
		});
	});

	test('components can be added, imported and removed', async ({ page }) => {
		await goto(page, '/playground/hello-world');
		await expect(editor(page)).toContainText('Hello');

		// the name of a new component is focused
		await page.getByRole('button', { name: 'add new component' }).click();
		await page.keyboard.press('ControlOrMeta+a');
		await page.keyboard.insertText('Child.svelte');
		await page.keyboard.press('Enter');

		const tab = page.locator('.file-tabs [role="button"]').filter({ hasText: 'Child.svelte' });
		await expect(tab).toBeVisible();
		await type(page, '<p>I am the child</p>');

		await page.locator('.file-tabs [role="button"]').filter({ hasText: 'App.svelte' }).click();
		await expect(editor(page)).toContainText('Hello');
		await type(page, `<script>\n\timport Child from './Child.svelte';\n</script>\n\n<Child />`);

		await expect(result(page).getByText('I am the child')).toBeVisible({ timeout: 60_000 });

		page.once('dialog', (dialog) => dialog.accept());
		await tab.click();
		await page.getByRole('button', { name: 'Delete Child.svelte', exact: true }).click();
		await expect(tab).toHaveCount(0);
	});

	test('the name can be changed', async ({ page }) => {
		await goto(page, '/playground/hello-world');

		await name(page).fill('My app');
		await name(page).press('Enter');

		await expect(page).toHaveTitle('My app • Playground • Svelte');
		await expect(name(page)).not.toBeFocused();
	});

	test('examples can be opened from the menu', async ({ page }) => {
		await goto(page, '/playground/hello-world');

		await page.locator('summary[aria-label="Examples"]').click();

		const menu = page.locator('.secondary-nav-dropdown');
		await expect(menu.getByRole('link', { name: 'Hello world', exact: true })).toHaveAttribute(
			'aria-current',
			'page'
		);

		await menu.locator('summary', { hasText: 'Logic' }).click();
		await menu.getByRole('link', { name: 'Each blocks', exact: true }).click();

		await expect(page).toHaveURL(/\/playground\/each-blocks/);
		await expect(name(page)).toHaveValue('Each blocks');
		await expect(editor(page)).toContainText('{#each');
	});

	test('a blank app can be created from the menu', async ({ page }) => {
		await goto(page, '/playground/each-blocks');

		await page.locator('summary[aria-label="Examples"]').click();
		await page.getByRole('link', { name: 'Create new', exact: true }).click();

		await expect(page).toHaveURL(/\/playground\/untitled/);
		await expect(name(page)).toHaveValue('Untitled');
	});

	test('the Svelte version can be pinned through the URL', async ({ page }) => {
		await goto(page, '/playground/hello-world?version=5.0.0');

		// the input is inside a hover menu

		await expect(page.getByRole('textbox', { name: 'Svelte version' })).toHaveValue('5.0.0');
		await expect(result(page).getByRole('heading', { name: 'Hello world!' })).toBeVisible({
			timeout: 60_000
		});
	});

	test('the app can be downloaded as a project', async ({ page }) => {
		await goto(page, '/playground/hello-world');
		await expect(editor(page)).toContainText('Hello');

		const download = page.waitForEvent('download');
		await page.getByRole('button', { name: 'Download app' }).dispatchEvent('click');

		expect((await download).suggestedFilename()).toBe('svelte-app.zip');
	});

	test('saving and forking require signing in', async ({ page }) => {
		await goto(page, '/playground/hello-world');

		await expect(page.getByRole('button', { name: 'log in to save' })).toBeDisabled();
		await expect(page.getByRole('button', { name: 'log in to fork' })).toBeDisabled();

		await page.getByText('log in', { exact: true }).hover();
		const popup = page.waitForEvent('popup');
		await page.getByRole('button', { name: 'Log in with GitHub' }).click();

		expect(new URL((await popup).url()).pathname).toBe('/auth/login');
	});

	test('shows a 404 for apps that do not exist', async ({ page }) => {
		const response = await page.goto('/playground/00000000000000000000000000000000');

		expect(response?.status()).toBe(404);
	});
});

test.describe('embedded playground', () => {
	test('renders without the site navigation', async ({ page }) => {
		await page.goto('/playground/hello-world/embed');

		await expect(page.getByRole('navigation', { name: 'Primary' })).toHaveCount(0);
		await expect(page.locator('.cm-content').first()).toContainText('<h1>Hello {name}!</h1>');
		await expect(
			page.locator('iframe').first().contentFrame().getByRole('heading', { name: 'Hello world!' })
		).toBeVisible({ timeout: 60_000 });
	});

	test('can show only the output', async ({ page }) => {
		await page.goto('/playground/hello-world/embed?output-only');

		await expect(
			page.locator('iframe').first().contentFrame().getByRole('heading', { name: 'Hello world!' })
		).toBeVisible({ timeout: 60_000 });
		// the editor is collapsed, not removed
		await expect(page.locator('.cm-content').first()).not.toBeInViewport();
	});
});
