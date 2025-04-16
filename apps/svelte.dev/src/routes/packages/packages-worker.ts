import type { Package } from '$lib/server/content';
import { init, search, search_criteria } from './packages-search';

let packages: Package[] = [];

addEventListener('message', async (event) => {
	const { type, payload } = event.data;

	if (type === 'init') {
		const data = await fetch(`${payload.origin}/packages/data.json`).then((r) => r.json());
		await init(data);

		packages = [];

		postMessage({ type: 'ready' });
	}

	if (type === 'get') {
		let { query, svelte_versions = [], sort_by } = payload;

		const regex = new RegExp(query, 'i');

		console.time('naive search');
		const filtered = packages.filter((pkg) => regex.test(pkg.name) || regex.test(pkg.description));
		console.timeEnd('naive search');

		sort_by = search_criteria.includes(sort_by) ? sort_by : 'popularity';

		if (!query) return;

		const current_results = query
			? await search(query, {
					sort_by,
					filters: {
						svelte_versions: (svelte_versions as string[]).reduce(
							(acc, val) => {
								acc[val] = true;
								return acc;
							},
							{} as Record<string, boolean>
						)
					}
				})
			: [];

		postMessage({
			type: 'results',
			payload: {
				results: current_results,
				query
			}
		});
	}
});
