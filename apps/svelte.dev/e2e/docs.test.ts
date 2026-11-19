import { expect, goto, main, test } from './fixtures.ts';

test.describe('docs index', () => {
	test('links to each set of docs and to related resources', async ({ page }) => {
		await goto(page, '/docs');

		const content = main(page);

		for (const href of ['/docs/svelte', '/docs/kit', '/tutorial', '/playground', '/docs/llms']) {
			await expect(content.locator(`a[href="${href}"]`).first(), href).toBeVisible();
		}

		await content.locator('a[href="/docs/svelte"]').first().click();
		await expect(page).toHaveURL('/docs/svelte/overview');
	});

	test('/docs/llms explains the llms.txt files', async ({ page }) => {
		await page.goto('/docs/llms');

		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
		await expect(main(page).locator('a[href="/llms.txt"]').first()).toBeVisible();
	});
});

test.describe('docs page', () => {
	test('renders the document with metadata', async ({ page }) => {
		await page.goto('/docs/svelte/overview');

		await expect(page).toHaveTitle('Overview • Svelte Docs');
		await expect(page.getByRole('heading', { level: 1, name: 'Overview' })).toBeVisible();
		await expect(page.locator('meta[name="description"]')).toHaveAttribute(
			'content',
			'Overview • Svelte documentation'
		);
		await expect(page.locator('meta[name="og:image"]')).toHaveAttribute(
			'content',
			'https://svelte.dev/docs/svelte/overview/card.png'
		);
		await expect(page.locator('#docs-content .text.content')).toContainText(
			'Svelte is a framework'
		);
	});

	test('the sidebar lists the pages of the topic and highlights the current one', async ({
		page
	}) => {
		await goto(page, '/docs/svelte/overview');

		const sidebar = page.getByRole('navigation', { name: 'Docs' });
		await expect(sidebar.getByRole('heading', { name: 'Runes' })).toBeVisible();
		await expect(sidebar.locator('a[href="/docs/svelte/overview"]')).toHaveAttribute(
			'aria-current',
			'page'
		);

		await sidebar.getByRole('link', { name: '$state', exact: true }).click();

		await expect(page).toHaveURL('/docs/svelte/$state');
		await expect(page.getByRole('heading', { level: 1, name: '$state' })).toBeVisible();
		await expect(sidebar.getByRole('link', { name: '$state', exact: true })).toHaveAttribute(
			'aria-current',
			'page'
		);
		await expect(sidebar.locator('a[href="/docs/svelte/overview"]')).not.toHaveAttribute(
			'aria-current'
		);
	});

	test('each topic has its own sidebar', async ({ page }) => {
		await page.goto('/docs/kit/introduction');
		await expect(page).toHaveTitle('Introduction • SvelteKit Docs');
		await expect(
			page
				.getByRole('navigation', { name: 'Docs' })
				.getByRole('link', { name: 'Routing', exact: true })
		).toBeVisible();

		await page.goto('/docs/cli/overview');
		await expect(
			page.getByRole('navigation', { name: 'Docs' }).getByRole('link', { name: 'sv create' })
		).toBeVisible();
	});

	test('previous and next links walk through the docs', async ({ page }) => {
		await goto(page, '/docs/svelte/getting-started');

		const controls = page.locator('#docs-content .controls');
		await expect(controls.getByRole('link', { name: 'Overview' })).toHaveAttribute(
			'href',
			'/docs/svelte/overview'
		);

		await controls.getByRole('link', { name: '.svelte files' }).click();
		await expect(page).toHaveURL('/docs/svelte/svelte-files');
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('.svelte files');

		await controls.getByRole('link', { name: 'Getting started' }).click();
		await expect(page).toHaveURL('/docs/svelte/getting-started');
	});

	test('links to the source on GitHub and to llms.txt', async ({ page }) => {
		await page.goto('/docs/svelte/$state');

		await expect(page.getByRole('link', { name: 'Edit this page on GitHub' })).toHaveAttribute(
			'href',
			'https://github.com/sveltejs/svelte/edit/main/documentation/docs/02-runes/02-$state.md'
		);
		await expect(page.getByRole('link', { name: 'llms.txt' })).toHaveAttribute(
			'href',
			'/docs/svelte/$state/llms.txt'
		);
	});

	test('"on this page" links jump to sections', async ({ page }) => {
		await page.setViewportSize({ width: 1440, height: 900 });
		await goto(page, '/docs/svelte/$state');

		const on_this_page = page.locator('.on-this-page');
		await on_this_page.getByRole('link', { name: '$state.raw' }).click();

		await expect(page).toHaveURL('/docs/svelte/$state#$state.raw');
		await expect(page.locator('[id="$state.raw"]')).toBeInViewport();
		await expect(on_this_page.getByRole('link', { name: '$state.raw' })).toHaveClass(/active/);
	});

	test('headings have permalinks', async ({ page }) => {
		await goto(page, '/docs/svelte/$state');

		const heading = page.locator('[id="Deep-state"]');
		await heading.hover();
		await heading.getByRole('link', { name: 'permalink' }).click();

		await expect(page).toHaveURL('/docs/svelte/$state#Deep-state');
	});

	test('legacy lowercase hashes are redirected to the right heading', async ({ page }) => {
		await page.goto('/docs/svelte/$state#deep-state');

		await expect(page).toHaveURL('/docs/svelte/$state#Deep-state');
	});
});

test.describe('code blocks', () => {
	test('can be copied', async ({ page }) => {
		// only chromium lets tests read the real clipboard
		await page.addInitScript(() => {
			navigator.clipboard.writeText = async (text) => {
				(window as any).copied = text;
			};
		});
		await goto(page, '/docs/svelte/$state');

		const block = page
			.locator('.code-block')
			.filter({ has: page.getByRole('button', { name: 'Copy to clipboard' }) })
			.first();
		await block.getByRole('button', { name: 'Copy to clipboard' }).click();

		const copied: string = await page.evaluate(() => (window as any).copied);
		expect(copied.length).toBeGreaterThan(10);
		expect(await block.locator('code').first().innerText()).toContain(copied.split('\n')[0].trim());
	});

	test('can be switched between TypeScript and JavaScript everywhere at once', async ({ page }) => {
		await goto(page, '/docs/kit/load');

		const toggles = page.getByRole('checkbox', { name: 'Toggle JS/TS' });
		const block = page.locator('.code-block').filter({ has: toggles }).first();
		const js = block.locator('pre[data-js]:not([data-ts])');
		const ts = block.locator('pre[data-ts]:not([data-js])');

		await expect(toggles.first()).toBeChecked();
		await expect(ts).toBeVisible();
		await expect(js).toBeHidden();

		await toggles.first().click();

		await expect(toggles.first()).not.toBeChecked();
		await expect(toggles.nth(1)).not.toBeChecked();
		await expect(js).toBeVisible();
		await expect(ts).toBeHidden();

		await page.reload();
		await expect(toggles.first()).not.toBeChecked();
		await expect(js).toBeVisible();
	});

	test('multi-file examples can be switched between files and opened in the playground', async ({
		page
	}) => {
		await goto(page, '/docs/svelte/$props');

		const block = page
			.locator('.code-block')
			.filter({ has: page.locator('[role="tab"] + [role="tab"]') })
			.first();
		const tabs = block.getByRole('tab');
		const selected = block.getByRole('tab', { selected: true });
		const panel = block.locator('[role="tabpanel"][data-visible="true"]');

		await expect(tabs).toHaveCount(2);
		await expect(selected).toHaveCount(1);
		await expect(panel).toBeVisible();

		const other = block.getByRole('tab', { selected: false });
		const name = await other.innerText();
		const id = await other.getAttribute('aria-controls');

		await other.click();
		await expect(selected).toHaveText(name);
		await expect(panel).toHaveAttribute('id', id!);
		await expect(panel).toBeVisible();

		await page.keyboard.press('ArrowRight');
		await expect(selected).not.toHaveText(name);
		await expect(selected).toBeFocused();

		await block.getByRole('link', { name: /Open/ }).click();
		await expect(page).toHaveURL(/\/playground\/untitled.*#H4sIA/);
		await expect(page.locator('.repl-outer .file-tabs [role="button"]')).toHaveCount(2);
	});

	test('legacy mode notes can be expanded', async ({ page }) => {
		await goto(page, '/docs/svelte/what-are-runes');

		const details = page.locator('details.legacy').first();
		await expect(details).not.toHaveAttribute('open');

		await details.locator('summary').click();
		await expect(details).toHaveAttribute('open');
	});
});

test.describe('removed docs pages', () => {
	for (const path of [
		'/docs/logic-blocks',
		'/docs/special-elements',
		'/docs/element-directives',
		'/docs/component-directives',
		'/docs/kit/modules'
	]) {
		test(`${path} points to the new locations`, async ({ page }) => {
			const response = await page.goto(path);

			expect(response?.status()).toBe(200);
			await expect(main(page).locator('a[href^="/docs/"]').first()).toBeVisible();
		});
	}
});
