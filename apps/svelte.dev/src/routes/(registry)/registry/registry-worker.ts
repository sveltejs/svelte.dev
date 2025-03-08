import type { Package } from '$lib/server/content';
import {
	getPackagesByTag,
	getSortedRegistry,
	init,
	REGISTRY_PAGE_LIMIT,
	search
} from '../registry-search';

addEventListener('message', async (event) => {
	const { type, payload } = event.data;

	if (type === 'init') {
		const res = await fetch(`${payload.origin}/registry.json`);
		const { blocks } = await res.json();
		init(blocks);

		postMessage({ type: 'ready' });
	}

	if (type === 'get') {
		const { query, page = 0, tag = 'all' } = payload;

		let current_results: Package[] | null = null;

		if (query) {
			current_results = search(query);
		}

		if (tag && current_results == null && tag !== 'all') {
			current_results = getPackagesByTag(tag);
		}

		if (current_results == null) {
			current_results = getSortedRegistry();
		}

		postMessage({
			type: 'results',
			payload: {
				results: current_results.slice(
					page * REGISTRY_PAGE_LIMIT,
					page * REGISTRY_PAGE_LIMIT + REGISTRY_PAGE_LIMIT
				),
				query
			}
		});
	}

	// if (type === 'recents') {
	// 	const results = payload.map(lookup).filter(Boolean);

	// 	postMessage({ type: 'recents', payload: results });
	// }
});
