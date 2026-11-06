import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from 'vitest';
import { collapse_routes } from './collapse-vercel-routes.js';

type Route = Parameters<typeof collapse_routes>[0][number];

function pair(src: string): Route[] {
	return [
		{ src, dest: `${src}/` },
		{ src: `${src}/`, status: 308, headers: { Location: src } }
	];
}

function match(routes: Route[], pathname: string) {
	for (const route of routes) {
		if (!route.src) continue;
		const captures = new RegExp(route.src).exec(pathname);
		if (!captures) continue;
		const substitute = (value: string) => value.replace(/\$(\d+)/g, (_, i) => captures[Number(i)]);
		return {
			dest: route.dest && substitute(route.dest),
			status: route.status,
			location: route.headers?.Location && substitute(route.headers.Location)
		};
	}
}

test.each([
	'/e/kit',
	'/docs/svelte',
	'/docs/kit',
	'/docs/cli',
	'/docs/ai',
	'/tutorial/svelte',
	'/tutorial/kit',
	'/blog'
])('collapses %s page pairs into an anchored rewrite and redirect', (prefix) => {
	const original = [...pair(`${prefix}/one`), ...pair(`${prefix}/two`)];
	const routes = collapse_routes(original);
	expect(routes).toHaveLength(2);
	expect(original).toHaveLength(4);

	for (const slug of ['one', 'two', 'unknown', '$app-paths', 'legacy-$$props', '@sveltejs-kit']) {
		const pathname = `${prefix}/${slug}`;
		expect(match(routes, pathname)).toEqual({ dest: `${pathname}/` });
		expect(match(routes, `${pathname}/`)).toEqual({ status: 308, location: pathname });
	}

	for (const pathname of [
		prefix,
		`${prefix}/`,
		`${prefix}/one/nested`,
		`${prefix}/one/__data.json`,
		`${prefix}/rss.xml`,
		`${prefix}/llms.txt`,
		`${prefix}/one//`,
		`/other${prefix}/one`
	]) {
		expect(match(routes, pathname)).toBeUndefined();
	}
});

test('preserves specific redirects, dotted pages, unrelated rules and routing phases', () => {
	const redirect = {
		src: '/tutorial/kit/env-static-private/?',
		status: 308,
		headers: { Location: '/tutorial/kit/env-private' }
	};
	const transform = { src: '.*', continue: true, transforms: [{ type: 'request.query' }] };
	const cache = { src: '/_app/immutable/.+', headers: { 'cache-control': 'public' } };
	const filesystem = { handle: 'filesystem' };
	const dynamic = { src: '^/docs/([^/]+)/assets/([^/]+)$', dest: '/docs/[topic]/assets/[name]' };
	const routes = collapse_routes([
		transform,
		redirect,
		...pair('/tutorial/kit/env-private'),
		...pair('/blog/announcing-sveltekit-1.0'),
		...pair('/tutorial/kit/env-public'),
		...pair('/blog'),
		...pair('/unrelated/one'),
		...pair('/unrelated/two'),
		cache,
		filesystem,
		dynamic,
		...pair('/e/kit/one'),
		...pair('/e/kit/two')
	]);

	expect(routes.slice(0, 4)).toEqual([
		transform,
		redirect,
		...pair('/blog/announcing-sveltekit-1.0')
	]);
	expect(match(routes.slice(1), '/tutorial/kit/env-static-private/')).toEqual({
		status: 308,
		location: '/tutorial/kit/env-private'
	});
	expect(routes.slice(-8)).toEqual([
		pair('/unrelated/two')[1],
		cache,
		filesystem,
		dynamic,
		...pair('/e/kit/one'),
		...pair('/e/kit/two')
	]);
});

test.each<Route>([
	{ status: 307, headers: { Location: '/docs/kit/three' } },
	{ status: 308, headers: { Location: '/somewhere-else' } },
	{ status: 308, headers: { Location: '/docs/kit/three', 'cache-control': 'no-store' } },
	{ status: 308, headers: { Location: '/docs/kit/three' }, continue: true }
])('leaves a namespace alone if a pair has unexpected behavior: %j', (redirect) => {
	const original = [
		...pair('/docs/kit/one'),
		...pair('/docs/kit/two'),
		{ src: '/docs/kit/three', dest: '/docs/kit/three/' },
		{ src: '/docs/kit/three/', ...redirect }
	];
	expect(collapse_routes(original)).toEqual(original);
});

test('leaves incomplete, non-adjacent and slash-always pairs alone', () => {
	const original = [
		...pair('/e/kit/one'),
		{ src: '/e/kit/two', dest: '/e/kit/two/' },
		...pair('/blog/one'),
		{ src: '/blog/two', dest: '/blog/two/' },
		{ src: '/unrelated', status: 404 },
		{ src: '/blog/two/', status: 308, headers: { Location: '/blog/two' } },
		...pair('/docs/kit/one'),
		{ src: '/docs/kit/two/', dest: '/docs/kit/two' },
		{ src: '/docs/kit/two', status: 308, headers: { Location: '/docs/kit/two/' } }
	];
	expect(collapse_routes(original)).toEqual(original);
});

test('does not expand a single pair and is idempotent', () => {
	const original = [...pair('/e/kit/one'), ...pair('/e/kit/two'), ...pair('/blog/one')];
	const collapsed = collapse_routes(original);
	expect(collapsed).toHaveLength(4);
	expect(collapsed.slice(-2)).toEqual(pair('/blog/one'));
	expect(collapse_routes(collapsed)).toEqual(collapsed);
});

test('the CLI rewrites only routes and can be run again without changing the output', () => {
	const directory = mkdtempSync(join(tmpdir(), 'svelte-dev-vercel-routes-'));
	const file = join(directory, 'config.json');
	const script = fileURLToPath(new URL('./collapse-vercel-routes.js', import.meta.url));
	const config = {
		version: 3,
		routes: [...pair('/e/kit/one'), ...pair('/e/kit/two'), { handle: 'filesystem' }],
		overrides: { 'e/kit/one.html': { path: 'e/kit/one' } },
		images: { sizes: [640] }
	};

	try {
		writeFileSync(file, JSON.stringify(config));
		const output = execFileSync(process.execPath, [script, file], { cwd: directory }).toString();
		expect(output).toContain('5 → 3');
		const contents = readFileSync(file, 'utf8');
		expect(JSON.parse(contents)).toEqual({ ...config, routes: collapse_routes(config.routes) });
		execFileSync(process.execPath, [script, file], { cwd: directory });
		expect(readFileSync(file, 'utf8')).toBe(contents);
	} finally {
		rmSync(directory, { recursive: true, force: true });
	}
});
