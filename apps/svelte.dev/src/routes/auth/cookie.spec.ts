import { afterEach, describe, expect, test, vi } from 'vitest';

vi.mock('$app/env/private', () => ({ GITHUB_CLIENT_ID: 'id', GITHUB_CLIENT_SECRET: 'secret' }));

vi.mock('#lib/db/session.js', () => ({
	create: async () => ({ sessionid: 'abc', expires: new Date('2030-01-01') }),
	destroy: async () => {}
}));

const { GET: callback } = await import('./callback/+server.ts');
const { GET: logout } = await import('./logout/+server.js');

function event(href: string) {
	const url = new URL(href);
	return { url, request: new Request(url, { headers: { cookie: 'sid=abc' } }) } as any;
}

function attributes(response: Response) {
	return response.headers
		.get('set-cookie')!
		.split(';')
		.map((part) => part.trim());
}

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('session cookie', () => {
	test('is only sent over HTTPS once set on an HTTPS site', async () => {
		// the handler asks GitHub for a token and then for the user
		vi.stubGlobal('fetch', async () => new Response('{}'));

		const attrs = attributes(await callback(event('https://svelte.dev/auth/callback?code=x')));

		expect(attrs[0]).toBe('sid=abc');
		expect(attrs).toContain('HttpOnly');
		expect(attrs).toContain('Secure');
	});

	test('is cleared with the same attributes when signing out', async () => {
		const attrs = attributes(await logout(event('https://svelte.dev/auth/logout')));

		expect(attrs[0]).toBe('sid=');
		expect(attrs).toContain('HttpOnly');
		expect(attrs).toContain('Secure');
	});

	test('still works over plain HTTP during development', async () => {
		const attrs = attributes(await logout(event('http://localhost:5173/auth/logout')));

		expect(attrs).not.toContain('Secure');
	});
});
