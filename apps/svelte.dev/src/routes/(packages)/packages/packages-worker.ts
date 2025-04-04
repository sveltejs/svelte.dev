import { init, REGISTRY_PAGE_LIMIT, search, search_criteria } from './packages-search';

addEventListener('message', async (event) => {
	const { type, payload } = event.data;

	if (type === 'init') {
		const data = await fetch(`${payload.origin}/packages.json`).then((r) => r.json());
		init(data);

		postMessage({ type: 'ready' });
	}

	if (type === 'get') {
		let { query, page = 1, svelte_5_only = false, hide_outdated = false, sort_by } = payload;

		sort_by = search_criteria.includes(sort_by) ? sort_by : 'popularity';

		if (!query) return;

		const current_results = search(query, {
			sort_by,
			filters: {
				svelte_5_only,
				hide_outdated
			}
		});

		const total_pages = Math.ceil(current_results.length / REGISTRY_PAGE_LIMIT);

		if (page > total_pages && total_pages !== 0) {
			page = 1;

			console.log('Redirecting to page 0');
			postMessage({
				type: 'update-page',
				payload: {
					page: page
				}
			});

			return;
		}

		postMessage({
			type: 'results',
			payload: {
				results: current_results.slice(
					(page - 1) * REGISTRY_PAGE_LIMIT,
					page * REGISTRY_PAGE_LIMIT
				),
				total_pages,
				query
			}
		});
	}
});
