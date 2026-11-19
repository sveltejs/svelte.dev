import { is_login, expect, goto, main, test } from './fixtures.ts';
import type { Page } from '@playwright/test';
import { disposable_session_ids } from './db.ts';

const editor = (page: Page) => page.locator('.repl-outer .cm-content').first();
const name = (page: Page) => page.locator('.repl-outer input').first();
const save = (page: Page) => page.getByRole('button', { name: /^save/ });

/** matches the url of a saved app but not of an example */
const saved = /\/playground\/[0-9a-f-]{32,36}(\?|$)/;

let prefix: string;

// unique per attempt so apps left behind by earlier ones do not interfere
test.beforeAll(() => {
	prefix = `e2e-${Date.now()}`;
});

async function type(page: Page, code: string) {
	await editor(page).click();
	await page.keyboard.press('ControlOrMeta+a');
	await page.keyboard.insertText(code);
}

/** ids are uuids with or without dashes */
const id = (url: string) => new URL(url).pathname.split('/')[2].replaceAll('-', '');

/** saves the playground contents as a new app and returns its id */
async function create(page: Page, app: string, code: string) {
	await goto(page, '/playground/untitled');
	await expect(editor(page)).toBeVisible();

	await type(page, code);
	await name(page).fill(app);
	await save(page).click();

	await expect(page).toHaveURL(saved);
	return id(page.url());
}

test.describe('signed out', () => {
	test('saved apps require signing in', async ({ page }) => {
		await goto(page, '/apps');

		await expect(page).toHaveTitle('Your apps • Svelte');
		await expect(main(page)).toContainText('Please log in to see your saved apps.');

		const popup = page.waitForEvent('popup');
		const login = page.context().waitForEvent('request', is_login);
		await main(page).getByRole('link', { name: 'log in' }).click();

		await popup;
		await login;
	});

	test('saved apps cannot be deleted', async ({ request }) => {
		const response = await request.post('/apps/destroy', { data: { ids: ['nope'] } });

		expect(response.status()).toBe(401);
	});
});

test.describe('signed in', () => {
	test.use({ signed_in: true });

	// these tests share a user whose list of apps each of them changes
	test.describe.configure({ mode: 'serial' });

	test('the playground shows who is signed in', async ({ page }) => {
		await goto(page, '/playground/hello-world');

		await expect(page.locator('.repl-outer').getByText('Test User')).toBeVisible();
		await expect(save(page)).toBeEnabled();
		await expect(page.getByRole('button', { name: 'fork' })).toBeEnabled();
	});

	test('saving an example creates an app that belongs to the user', async ({ page }) => {
		const app = await create(page, `${prefix} saved`, '<h1>saved</h1>');

		await goto(page, `/playground/${app}`);
		await expect(name(page)).toHaveValue(`${prefix} saved`);
		await expect(editor(page)).toContainText('<h1>saved</h1>');

		await goto(page, '/apps');
		await expect(page.getByRole('heading', { level: 1, name: 'Your apps' })).toBeVisible();
		await expect(main(page)).toContainText('Test User');

		const link = page.getByRole('link', { name: `${prefix} saved` });
		await expect(link).toContainText('updated');
		await link.click();

		await expect(page).toHaveURL((url) => saved.test(url.href) && id(url.href) === app);
		await expect(editor(page)).toContainText('<h1>saved</h1>');
	});

	test('saving again updates the app in place', async ({ page }) => {
		const app = await create(page, `${prefix} updated`, '<h1>before</h1>');

		await type(page, '<h1>after</h1>');
		await expect(save(page).locator('.badge')).toBeVisible();

		await page.keyboard.press('ControlOrMeta+s');
		await expect(save(page).locator('.badge')).toBeHidden();
		expect(id(page.url())).toBe(app);

		await goto(page, `/playground/${app}`);
		await expect(editor(page)).toContainText('<h1>after</h1>');
	});

	test('forking creates a copy', async ({ page }) => {
		const app = await create(page, `${prefix} original`, '<h1>original</h1>');

		await name(page).fill(`${prefix} fork`);
		await page.getByRole('button', { name: 'fork' }).click();

		await expect(page).toHaveURL((url) => saved.test(url.href) && id(url.href) !== app);
		await expect(editor(page)).toContainText('<h1>original</h1>');

		await goto(page, '/apps');
		await expect(page.getByRole('link', { name: `${prefix} original` })).toBeVisible();
		await expect(page.getByRole('link', { name: `${prefix} fork` })).toBeVisible();
	});

	test('saved apps can be searched', async ({ page }) => {
		await goto(page, '/apps');

		const search = main(page).getByRole('searchbox', { name: 'Search' });
		await search.fill(`${prefix} fork`);
		await search.press('Enter');

		await expect(page).toHaveURL(`/apps?search=${encodeURIComponent(`${prefix} fork`)}`);
		await expect(page.getByRole('link', { name: `${prefix} fork` })).toBeVisible();
		await expect(page.getByRole('link', { name: `${prefix} original` })).toHaveCount(0);

		await search.fill('this matches nothing at all');
		await search.press('Enter');
		await expect(main(page)).toContainText('No apps here');
	});

	test('saved apps can be deleted', async ({ page }) => {
		await goto(page, `/apps?search=${prefix}`);

		const items = page.getByRole('listitem').filter({ hasText: prefix });
		await expect(items).toHaveCount(4);

		const checkbox = (app: string) =>
			items.filter({ hasText: app }).getByRole('checkbox', { name: 'Select for deletion' });

		await checkbox(`${prefix} fork`).check({ force: true });
		await expect(page.getByRole('button', { name: 'Delete 1 app' })).toBeVisible();

		await page.getByRole('button', { name: 'Clear selection' }).click();
		await expect(checkbox(`${prefix} fork`)).not.toBeChecked();

		await checkbox(`${prefix} fork`).check({ force: true });
		await checkbox(`${prefix} original`).check({ force: true });

		page.once('dialog', (dialog) => {
			expect(dialog.message()).toBe('Are you sure you want to delete 2 apps?');
			dialog.dismiss();
		});
		await page.getByRole('button', { name: 'Delete 2 apps' }).click();
		await expect(items).toHaveCount(4);

		page.once('dialog', (dialog) => dialog.accept());
		await page.getByRole('button', { name: 'Delete 2 apps' }).click();

		await expect(items).toHaveCount(2);
		await expect(page.getByRole('link', { name: `${prefix} fork` })).toHaveCount(0);

		await page.reload();
		await expect(items).toHaveCount(2);
	});

	test('apps that belong to someone else are forked when saved', async ({ page, browser }) => {
		const app = await create(page, `${prefix} shared`, '<h1>shared</h1>');

		const context = await browser.newContext();
		const visitor = await context.newPage();
		await visitor.goto(`/playground/${app}`);
		await expect(editor(visitor)).toContainText('<h1>shared</h1>');
		await expect(visitor.getByRole('button', { name: 'log in to save' })).toBeDisabled();

		const response = await context.request.put(`/playground/save/${app}`, {
			data: { name: 'hijacked', files: [] }
		});
		expect(response.status()).toBe(401);

		await context.close();
	});

	test('signing out', async ({ page, context, baseURL }, info) => {
		// signing out destroys the session so use one no other test depends on
		const attempt = info.repeatEachIndex * (info.project.retries + 1) + info.retry;
		const value = disposable_session_ids[attempt % disposable_session_ids.length];
		await context.addCookies([{ name: 'sid', value, url: baseURL }]);

		await goto(page, '/apps');
		await expect(page.getByRole('heading', { level: 1, name: 'Your apps' })).toBeVisible();

		await page.getByRole('link', { name: 'log out' }).click();
		await expect(main(page)).toContainText('Please log in to see your saved apps.');

		await page.reload();
		await expect(main(page)).toContainText('Please log in to see your saved apps.');
	});
});
