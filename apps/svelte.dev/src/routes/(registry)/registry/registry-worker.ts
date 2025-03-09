import { init, REGISTRY_PAGE_LIMIT, search } from '../registry-search';

addEventListener('message', async (event) => {
	const { type, payload } = event.data;

	if (type === 'init') {
		const { blocks } = await fetch(`${payload.origin}/registry.json`).then((r) => r.json());
		init(blocks);

		postMessage({ type: 'ready' });
	}

	if (type === 'get') {
		let { query, page = 0, tags = [], url } = payload;

		const current_results = search(query, { tags });
		const total_pages = Math.ceil(current_results.length / REGISTRY_PAGE_LIMIT);

		if (page > total_pages) {
			page = 0;

			postMessage({
				type: 'update-page',
				payload: {
					page: page
				}
			});

			return;
		}

		console.log(current_results.length);

		postMessage({
			type: 'results',
			payload: {
				results: current_results.slice(
					page * REGISTRY_PAGE_LIMIT,
					page * REGISTRY_PAGE_LIMIT + REGISTRY_PAGE_LIMIT
				),
				total_pages,
				query
			}
		});
	}
});
