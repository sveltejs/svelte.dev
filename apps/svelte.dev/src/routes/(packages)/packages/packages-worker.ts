import { init, REGISTRY_PAGE_LIMIT, search } from '../packages-search';

addEventListener('message', async (event) => {
	const { type, payload } = event.data;

	if (type === 'init') {
		const { blocks } = await fetch(`${payload.origin}/packages.json`).then((r) => r.json());
		init(blocks);

		postMessage({ type: 'ready' });
	}

	if (type === 'get') {
		let { query, page = 1, tags = [] } = payload;

		const current_results = search(query, { tags });
		const total_pages = Math.ceil(current_results.length / REGISTRY_PAGE_LIMIT);

		if (page > total_pages) {
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
					(page - 1) * REGISTRY_PAGE_LIMIT + REGISTRY_PAGE_LIMIT
				),
				total_pages,
				query
			}
		});
	}
});
