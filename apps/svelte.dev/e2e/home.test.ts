import { expect, goto, test } from './fixtures.ts';

test.describe('homepage', () => {
	test.beforeEach(async ({ page }) => {
		await goto(page, '/');
	});

	test('introduces Svelte', async ({ page }) => {
		await expect(page).toHaveTitle('Svelte • Web development for the rest of us');
		await expect(
			page.getByRole('heading', { level: 1, name: 'Svelte', exact: true })
		).toBeVisible();
		await expect(
			page.getByRole('heading', { name: 'web development for the rest of us' })
		).toBeVisible();

		for (const name of ['used by companies you’ve heard of', 'join our friendly community']) {
			await expect(page.getByRole('heading', { level: 2, name })).toBeAttached();
		}
	});

	test('the call to action leads to the docs', async ({ page }) => {
		await page.getByRole('link', { name: 'get started' }).first().click();

		await expect(page).toHaveURL('/docs');
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
	});

	test('the video can be played, paused and muted', async ({ page }) => {
		// reduced motion stops autoplay from racing with the controls
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await goto(page, '/');

		const figure = page.getByRole('figure', { name: 'Watch the full Svelte Origins documentary' });
		await figure.scrollIntoViewIfNeeded();

		const video = figure.locator('video');
		// the checkboxes are visually hidden behind icons
		const paused = figure.locator('.play-pause').getByRole('checkbox');
		const muted = figure.locator('.mute').getByRole('checkbox');

		await paused.check({ force: true });
		await expect(video).toHaveJSProperty('paused', true);

		await paused.uncheck({ force: true });
		await expect(video).toHaveJSProperty('paused', false);

		await muted.uncheck({ force: true });
		await expect(video).toHaveJSProperty('muted', false);

		await muted.check({ force: true });
		await expect(video).toHaveJSProperty('muted', true);
	});

	test('the video starts playing once it is fully in view', async ({ page }) => {
		const figure = page.getByRole('figure', { name: 'Watch the full Svelte Origins documentary' });
		const video = figure.locator('video');

		await expect(video).not.toBeInViewport();
		await expect(video).toHaveJSProperty('paused', true);

		await figure.scrollIntoViewIfNeeded();
		await expect(video).toBeInViewport({ ratio: 0.99 });
		await expect(video).toHaveJSProperty('paused', false);
	});

	test('the video does not play by itself when reduced motion is preferred', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await goto(page, '/');

		const figure = page.getByRole('figure', { name: 'Watch the full Svelte Origins documentary' });
		const video = figure.locator('video');

		await figure.scrollIntoViewIfNeeded();
		await expect(video).toBeInViewport({ ratio: 0.99 });

		// give playback a chance to start
		await page.waitForTimeout(1000);
		await expect(video).toHaveJSProperty('paused', true);
		await expect(figure.locator('.play-pause').getByRole('checkbox')).toBeChecked();
	});

	test('ends with the license', async ({ page }) => {
		const copyright = page.locator('.copyright');
		await copyright.scrollIntoViewIfNeeded();

		await expect(copyright).toContainText(`© ${new Date().getFullYear()} Svelte contributors`);
		await expect(
			copyright.getByRole('link', { name: 'free and open source software' })
		).toHaveAttribute('href', 'https://github.com/sveltejs/svelte');
	});
});
