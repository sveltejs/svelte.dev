import { init, search, search_criteria } from './packages-search';

addEventListener('message', async (event) => {
	const { type, payload } = event.data;

	if (type === 'init') {
		const data = await fetch(`${payload.origin}/packages.json`).then((r) => r.json());
		await init(data);

		postMessage({ type: 'ready' });
	}

	if (type === 'get') {
		let { query, svelte_versions = [], sort_by } = payload;

		sort_by = search_criteria.includes(sort_by) ? sort_by : 'popularity';

		if (!query) return;

		const current_results = await search(query, {
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
		});

		console.log(current_results);

		postMessage({
			type: 'results',
			payload: {
				results: current_results,
				query
			}
		});
	}
});
