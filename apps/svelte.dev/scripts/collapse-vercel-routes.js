// @ts-check
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

/**
 * @typedef {{ src?: string, dest?: string, status?: number, headers?: Record<string, string>, handle?: string, [key: string]: unknown }} Route
 */

// Temporary workaround for adapter-vercel emitting two routes for every prerendered page.
// Only these namespaces consist of single-segment pages with trailingSlash: 'never'.
// Exclude dotted names and nested paths so endpoints, assets and __data.json are untouched.
const prefixes = [
	'/e/kit',
	'/docs/svelte',
	'/docs/kit',
	'/docs/cli',
	'/docs/ai',
	'/tutorial/svelte',
	'/tutorial/kit',
	'/blog'
];

/** @param {Route[]} routes */
export function collapse_routes(routes) {
	// Never change function routing or cross a routing phase boundary.
	const boundary = routes.findIndex((route) => route.handle);
	const end = boundary === -1 ? routes.length : boundary;
	const removed = new Set();
	/** @type {Map<number, Route[]>} */
	const replacements = new Map();

	for (const prefix of prefixes) {
		const pattern = new RegExp(`^${prefix}/[^/.?]+/?$`);
		const pairs = [];
		let supported = true;

		for (let i = 0; i < end; i += 1) {
			const { src } = routes[i];
			if (!src || !pattern.test(src)) continue;

			// Require the exact adapter-generated pair, including its status and headers.
			// If a namespace contains exceptions, leave the entire namespace alone rather
			// than letting a wildcard swallow a route with different behavior.
			if (
				!src.endsWith('/') &&
				i + 1 < end &&
				isDeepStrictEqual(routes[i], { src, dest: `${src}/` }) &&
				isDeepStrictEqual(routes[i + 1], {
					src: `${src}/`,
					status: 308,
					headers: { Location: src }
				})
			) {
				pairs.push(i);
				i += 1;
			} else {
				supported = false;
				break;
			}
		}

		if (!supported || pairs.length < 2) continue;

		for (const i of pairs) {
			removed.add(i);
			removed.add(i + 1);
		}

		// Keep specific prerendered redirects ahead of the wildcard rules.
		replacements.set(pairs[pairs.length - 1], [
			{ src: `^(${prefix}/[^/.?]+)$`, dest: '$1/' },
			{ src: `^(${prefix}/[^/.?]+)/$`, status: 308, headers: { Location: '$1' } }
		]);
	}

	return routes.flatMap((route, i) => replacements.get(i) ?? (removed.has(i) ? [] : [route]));
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
	const file = process.argv[2] ?? new URL('../.vercel/output/config.json', import.meta.url);
	const config = JSON.parse(readFileSync(file, 'utf8'));
	const before = config.routes.length;
	config.routes = collapse_routes(config.routes);
	writeFileSync(file, `${JSON.stringify(config, null, '\t')}\n`);
	console.info(`[vercel] Collapsed prerendered routes: ${before} → ${config.routes.length}`);
}
