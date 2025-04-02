import { init, REGISTRY_PAGE_LIMIT, search, search_criteria } from '../packages-search';

addEventListener('message', async (event) => {
	const { type, payload } = event.data;

	if (type === 'init') {
		const { blocks } = await fetch(`${payload.origin}/packages.json`).then((r) => r.json());
		init(blocks);

		postMessage({ type: 'ready' });
	}

	if (type === 'get') {
		let {
			query,
			page = 1,
			tags = [],
			svelte_5_only = false,
			hide_outdated = false,
			sort_by,
			direction = 'dsc'
		} = payload;

		direction = direction === 'asc' ? 'asc' : 'dsc';
		sort_by = search_criteria.includes(sort_by) ? sort_by : 'popularity';

		const current_results = search(query, {
			tags,
			sort_by,
			direction,
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

		console.log({
			current_results,
			page,
			range: [(page - 1) * REGISTRY_PAGE_LIMIT, page * REGISTRY_PAGE_LIMIT],
			sliced: current_results.slice((page - 1) * REGISTRY_PAGE_LIMIT, page * REGISTRY_PAGE_LIMIT)
		});

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
