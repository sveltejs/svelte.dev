import { expect, goto, hydrated, primary_nav, test } from './fixtures.ts';

test.describe('primary navigation', () => {
	const links = [
		{ name: 'Docs', url: '/docs', title: /Docs • Svelte/ },
		{ name: 'Tutorial', url: '/tutorial/svelte/welcome-to-svelte', title: /Svelte Tutorial/ },
		{ name: 'Packages', url: '/packages', title: 'Packages • Svelte' },
		{ name: 'Blog', url: '/blog', title: 'Blog • Svelte' },
		{ name: 'Playground', url: /\/playground\/hello-world/, title: /Playground • Svelte/ }
	];

	for (const { name, url, title } of links) {
		test(`links to ${name}`, async ({ page }) => {
			await goto(page, '/');

			const link = primary_nav(page).getByRole('link', { name, exact: true });
			await link.click();

			await expect(page).toHaveURL(url);
			await expect(page).toHaveTitle(title);
			await expect(link).toHaveAttribute('aria-current', 'page');
		});
	}

	test('the logo links to the homepage', async ({ page }) => {
		await goto(page, '/blog');
		await primary_nav(page).getByRole('link', { name: 'Svelte', exact: true }).first().click();

		await expect(page).toHaveURL('/');
	});

	test('hovering Docs reveals links to each topic', async ({ page }) => {
		await goto(page, '/');

		const nav = primary_nav(page);
		const kit = nav.getByRole('link', { name: 'SvelteKit', exact: true });
		const menu = nav.locator('.dropdown-content').filter({ hasText: 'SvelteKit' });

		// the menu is hidden with opacity which Playwright still treats as visible
		await expect(menu).toHaveCSS('opacity', '0');
		await expect(menu).toHaveCSS('pointer-events', 'none');

		await nav.getByRole('link', { name: 'Docs', exact: true }).hover();
		await expect(menu).toHaveCSS('opacity', '1');
		await expect(nav.getByRole('link', { name: 'CLI', exact: true })).toBeVisible();
		await kit.click();

		await expect(page).toHaveURL('/docs/kit/introduction');
	});

	test('hovering Playground reveals a link to saved apps', async ({ page }) => {
		await goto(page, '/');

		const nav = primary_nav(page);
		await nav.getByRole('link', { name: 'Playground', exact: true }).hover();
		await nav.getByRole('link', { name: 'Your saved apps' }).click();

		await expect(page).toHaveURL('/apps');
	});

	test('links to social channels', async ({ page }) => {
		await goto(page, '/');
		const nav = primary_nav(page);

		await expect(nav.getByRole('link', { name: 'Discord Chat' })).toHaveAttribute('href', '/chat');
		await expect(nav.getByRole('link', { name: 'Svelte on Bluesky' })).toHaveAttribute(
			'href',
			'https://bsky.app/profile/svelte.dev'
		);
		await expect(nav.getByRole('link', { name: 'GitHub Organization' })).toHaveAttribute(
			'href',
			'https://github.com/sveltejs'
		);
	});

	test('the skip link moves focus to the main content', async ({ page }) => {
		await goto(page, '/docs/svelte/overview');

		await page.keyboard.press('Tab');
		const skip = page.getByRole('link', { name: 'Skip to main content' });
		await expect(skip).toBeFocused();

		await skip.press('Enter');
		await expect(page).toHaveURL('/docs/svelte/overview#main');
	});
});

test.describe('theme', () => {
	test('follows the system preference by default', async ({ page }) => {
		await page.emulateMedia({ colorScheme: 'dark' });
		await goto(page, '/');

		await expect(page.locator('html')).toHaveClass(/\bdark\b/);
		await expect(page.getByRole('button', { name: 'Toggle dark mode' }).first()).toHaveAttribute(
			'aria-pressed',
			'true'
		);
	});

	test('can be toggled, and the choice is remembered', async ({ page }) => {
		await page.emulateMedia({ colorScheme: 'light' });
		await goto(page, '/');

		const html = page.locator('html');
		const toggle = primary_nav(page).getByRole('button', { name: 'Toggle dark mode' }).first();

		await expect(html).toHaveClass(/\blight\b/);
		const background = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);

		await toggle.click();
		await expect(html).toHaveClass(/\bdark\b/);
		await expect(html).not.toHaveClass(/\blight\b/);
		await expect(toggle).toHaveAttribute('aria-pressed', 'true');
		expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).not.toBe(
			background
		);

		await page.reload();
		await hydrated(page);
		await expect(html).toHaveClass(/\bdark\b/);

		await toggle.click();
		await expect(html).toHaveClass(/\blight\b/);
	});
});

test.describe('font', () => {
	test('can be toggled, and the choice is remembered', async ({ page }) => {
		await goto(page, '/');

		const html = page.locator('html');
		const toggle = primary_nav(page).getByRole('button', { name: 'Toggle font' }).first();

		await expect(html).toHaveClass(/\bfont-elegant\b/);

		await toggle.click();
		await expect(html).toHaveClass(/\bfont-boring\b/);
		await expect(toggle).toHaveAttribute('aria-pressed', 'true');

		await page.reload();
		await hydrated(page);
		await expect(html).toHaveClass(/\bfont-boring\b/);
		await expect(toggle).toHaveAttribute('aria-pressed', 'true');
	});
});

test.describe('banner', () => {
	test('is shown while it is current, and stays dismissed', async ({ page }) => {
		await page.goto('/');

		const meta = page.locator('meta[name="sv:banner"]');
		test.skip((await meta.count()) === 0, 'no banner is configured');

		// banners only show between two dates
		const start = Number(await meta.getAttribute('data-start'));
		const end = Number(await meta.getAttribute('data-end'));
		await page.clock.setFixedTime(new Date((start + end) / 2));
		await goto(page, '/');

		const banner = page.locator('[data-banner]');
		await expect(banner).toBeVisible();
		await expect(banner.getByRole('link')).toHaveAttribute('href', /^https?:\/\//);

		await banner.getByRole('button', { name: 'Dismiss' }).click();
		await expect(banner).toBeHidden();

		await goto(page, '/');
		await expect(banner).toBeHidden();
	});

	test('is hidden once it has expired', async ({ page }) => {
		await page.goto('/');

		const meta = page.locator('meta[name="sv:banner"]');
		test.skip((await meta.count()) === 0, 'no banner is configured');

		const end = Number(await meta.getAttribute('data-end'));
		await page.clock.setFixedTime(new Date(end + 1000));
		await goto(page, '/');

		await expect(page.locator('[data-banner]')).toBeHidden();
	});
});

test.describe('errors', () => {
	test('unknown pages show a 404 message', async ({ page }) => {
		const response = await page.goto('/this-page-does-not-exist');
		expect(response?.status()).toBe(404);

		await expect(page.getByRole('heading', { level: 1 })).toContainText(/not found/i);
		await expect(primary_nav(page)).toBeVisible();
	});

	for (const path of ['/docs/svelte/does-not-exist', '/blog/does-not-exist', '/playground/nope']) {
		test(`${path} responds with 404`, async ({ page }) => {
			const response = await page.goto(path);

			expect(response?.status()).toBe(404);
			await expect(page.getByRole('heading', { level: 1 })).toContainText(/not found/i);
		});
	}
});
