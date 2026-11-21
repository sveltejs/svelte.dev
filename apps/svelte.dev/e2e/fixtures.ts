import { test as base, expect, type Page, type Request } from '@playwright/test';
import { session_id } from './db.ts';

export { expect };

export const test = base.extend<{ signed_in: boolean }>({
	/** browse as the test user */
	signed_in: [false, { option: true }],

	context: async ({ context, signed_in, baseURL }, use, info) => {
		if (signed_in) {
			info.skip(!!process.env.BASE_URL, 'the test user only exists in the local database');

			await context.addCookies([{ name: 'sid', value: session_id, url: baseURL }]);
		}

		await use(context);
	},

	page: async ({ page }, use) => {
		const errors: Error[] = [];
		page.on('pageerror', (error) => {
			// webkit reports fetches that a navigation cancelled
			if (/^Fetch API cannot load .+ due to access control checks/.test(error.message)) return;

			errors.push(error);
		});

		await use(page);

		expect(errors, 'the page should not throw uncaught exceptions').toEqual([]);
	}
});

/** resolves once the app has hydrated */
export async function hydrated(page: Page) {
	// the shortcut hint is only rendered in the browser
	await page.locator('nav[aria-label="Primary"] .shortcut').waitFor({ state: 'attached' });
}

/** navigates to a path and waits for hydration */
export async function goto(page: Page, path: string) {
	await page.goto(path);
	await hydrated(page);
}

/** some pages nest a second main element so it cannot be selected by role */
export const main = (page: Page) => page.locator('#main');

export const primary_nav = (page: Page) => page.getByRole('navigation', { name: 'Primary' });

/** matches the request that starts signing in, which a deployment then redirects to GitHub */
export const is_login = (request: Request) => new URL(request.url()).pathname === '/auth/login';
