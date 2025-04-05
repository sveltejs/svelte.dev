import { init, search, search_criteria } from './packages-search';

addEventListener('message', async (event) => {
	const { type, payload } = event.data;

	if (type === 'init') {
		const data = await fetch(`${payload.origin}/packages.json`).then((r) => r.json());
		init(data);

		postMessage({ type: 'ready' });
	}

	if (type === 'get') {
		let { query, svelte_5_only = false, hide_outdated = false, sort_by } = payload;

		sort_by = search_criteria.includes(sort_by) ? sort_by : 'popularity';

		if (!query) return;

		const current_results = search(query, {
			sort_by,
			filters: {
				svelte_5_only,
				hide_outdated
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
