import { expect, test } from './fixtures.ts';

test.describe('llms.txt', () => {
	test('/llms.txt links to the documentation sets', async ({ request }) => {
		const response = await request.get('/llms.txt');

		expect(response.status()).toBe(200);
		expect(response.headers()['content-type']).toContain('text/plain');

		const text = await response.text();
		expect(text).toContain('/docs/svelte/llms.txt');
		expect(text).toContain('/docs/kit/llms.txt');
		expect(text).toContain('/llms-full.txt');
	});

	for (const path of ['/llms-full.txt', '/llms-medium.txt', '/llms-small.txt']) {
		test(`${path} contains the docs as plain text`, async ({ request }) => {
			const response = await request.get(path);

			expect(response.status()).toBe(200);
			expect(response.headers()['content-type']).toContain('text/plain');
			expect(await response.text()).toContain('$state');
		});
	}

	test('each topic has an llms.txt', async ({ request }) => {
		for (const topic of ['svelte', 'kit', 'cli', 'ai']) {
			const response = await request.get(`/docs/${topic}/llms.txt`);

			expect(response.status(), topic).toBe(200);
			expect((await response.text()).length, topic).toBeGreaterThan(1000);
		}
	});

	test('each page has an llms.txt containing its markdown', async ({ request }) => {
		const response = await request.get('/docs/svelte/$state/llms.txt');

		expect(response.status()).toBe(200);
		expect(response.headers()['content-type']).toContain('text/plain');
		expect(await response.text()).toContain('$state.raw');
	});

	test('unknown pages have no llms.txt', async ({ request }) => {
		const response = await request.get('/docs/svelte/does-not-exist/llms.txt');

		expect(response.status()).toBe(404);
	});
});

test('/content.json contains the search index', async ({ request }) => {
	const response = await request.get('/content.json');
	expect(response.status()).toBe(200);

	const { blocks } = await response.json();
	expect(blocks.length).toBeGreaterThan(100);

	expect(blocks[0]).toEqual(
		expect.objectContaining({
			breadcrumbs: expect.any(Array),
			href: expect.any(String),
			content: expect.any(String)
		})
	);
});

test('/blog/rss.xml is a feed of blog posts', async ({ request }) => {
	const response = await request.get('/blog/rss.xml');

	expect(response.status()).toBe(200);
	expect(response.headers()['content-type']).toMatch(/\bxml\b/);

	const text = await response.text();
	expect(text).toContain('<rss');
	expect(text).toMatch(/<item>[\s\S]+<link>https:\/\/svelte\.dev\/blog\/[\w-]+<\/link>/);
});

test('/docs/experimental/sections.json lists docs sections', async ({ request }) => {
	const response = await request.get('/docs/experimental/sections.json');
	expect(response.status()).toBe(200);

	const sections = Object.values(await response.json()) as Array<Record<string, unknown>>;
	expect(sections.length).toBeGreaterThan(50);
	expect(sections[0]).toEqual(
		expect.objectContaining({ metadata: expect.any(Object), slug: expect.any(String) })
	);
});

test('/e/tmp/codes.json lists error codes', async ({ request }) => {
	const response = await request.get('/e/tmp/codes.json');
	expect(response.status()).toBe(200);

	expect(JSON.stringify(await response.json())).toContain('state_unsafe_mutation');
});

test('/devtools/updates.json describes the Firefox extension', async ({ request }) => {
	const response = await request.get('/devtools/updates.json');

	test.skip([403, 429].includes(response.status()), 'rate limited by GitHub');
	expect(response.status()).toBe(200);

	expect(await response.json()).toHaveProperty('addons');
});

test('/edge.svg renders a map', async ({ request }) => {
	const response = await request.get('/edge.svg');

	expect(response.status()).toBe(200);
	expect(response.headers()['content-type']).toBe('image/svg+xml');
	expect(await response.text()).toContain('<svg');
});

test.describe('playground API', () => {
	test('returns an example', async ({ request }) => {
		const response = await request.get('/playground/api/hello-world.json');
		expect(response.status()).toBe(200);

		const gist = await response.json();
		expect(gist).toEqual(
			expect.objectContaining({ id: 'hello-world', name: 'Hello world', owner: null })
		);
		expect(gist.components[0]).toEqual(
			expect.objectContaining({ name: 'App', type: 'svelte', source: expect.any(String) })
		);
	});

	test('lists all examples', async ({ request }) => {
		const response = await request.get('/playground/api/examples/all.json');
		expect(response.status()).toBe(200);

		const sections = await response.json();
		expect(sections.length).toBeGreaterThan(5);
		expect(sections[0].examples[0]).toEqual(
			expect.objectContaining({ title: expect.any(String), slug: expect.any(String) })
		);
	});

	test('responds with 404 for unknown apps', async ({ request }) => {
		const response = await request.get('/playground/api/does-not-exist.json');

		expect(response.status()).toBe(404);
	});

	test('rejects saving when signed out', async ({ request }) => {
		const response = await request.post('/playground/create.json', {
			data: { name: 'nope', files: [{ name: 'App.svelte', source: '' }] }
		});

		expect(response.status()).toBe(401);
	});
});

test.describe('tutorial API', () => {
	test('/tutorial/random-number returns a number', async ({ request }) => {
		// the endpoint fails at random on purpose
		await expect(async () => {
			const response = await request.get('/tutorial/random-number?min=5&max=6');

			expect(response.status()).toBe(200);
			expect(['5', '6']).toContain(await response.text());
		}).toPass();
	});

	test('/tutorial/api/album returns an album', async ({ request }) => {
		const response = await request.get('/tutorial/api/album');

		expect(response.status()).toBe(200);
		expect((await response.json())[0]).toHaveProperty('title');
	});
});

test('static metadata files are served', async ({ request }) => {
	for (const path of ['/robots.txt', '/manifest.json', '/opensearch.xml', '/favicon.png']) {
		const response = await request.get(path);

		expect(response.status(), path).toBe(200);
	}
});
