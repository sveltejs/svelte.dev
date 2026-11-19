import { defineConfig, devices } from '@playwright/test';

// dedicated so the suite never reuses a server started for something else
const port = 5183;

export default defineConfig({
	testDir: 'e2e',
	testMatch: '**/*.test.ts',
	globalSetup: './e2e/global-setup.ts',
	globalTeardown: './e2e/global-teardown.ts',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 2 : undefined,
	reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
	timeout: 60_000,
	expect: { timeout: 10_000 },
	use: {
		baseURL: `http://localhost:${port}`,
		trace: 'retain-on-failure'
	},
	projects: [
		{
			name: 'desktop',
			testIgnore: '**/*.mobile.test.ts',
			use: { ...devices['Desktop Chrome'] }
		},
		{
			name: 'mobile',
			testMatch: '**/*.mobile.test.ts',
			use: { ...devices['Pixel 7'] }
		}
	],
	webServer: {
		command: `${process.env.SKIP_BUILD ? '' : 'pnpm build && '}pnpm preview --port ${port} --strictPort`,
		port,
		// a reused server might not have the environment below
		reuseExistingServer: false,
		timeout: 300_000,
		env: {
			// overrides any real credentials in .env.local
			LOCAL_DATABASE: 'true',
			SUPABASE_URL: '',
			SUPABASE_KEY: '',
			// makes /auth/login respond locally instead of redirecting to GitHub
			GITHUB_CLIENT_ID: '',
			GITHUB_CLIENT_SECRET: ''
		}
	}
});
