import { registry, type Package } from '$lib/server/content';
import registry_json from '../../../lib/registry.json';
import {
	getPackagesByTag,
	getSortedRegistry,
	init,
	REGISTRY_PAGE_LIMIT,
	search
} from '../registry-search';

export const prerender = false;

export async function load({ url }) {
	const query = url.searchParams.get('query');
	const tag = url.searchParams.get('tag');
	const page = +(url.searchParams.get('page')?.toString() ?? 0);

	init(registry);

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

	return {
		registry: current_results.slice(
			page * REGISTRY_PAGE_LIMIT,
			page * REGISTRY_PAGE_LIMIT + REGISTRY_PAGE_LIMIT
		),
		tags: Object.entries(registry_json.tags).reduce(
			(acc, [key, value]) => {
				if (value.title) {
					acc.push({ tag: key, title: value.title, short_title: kebab_to_capital(key) });
				}
				return acc;
			},
			[] as { tag: string; title: string; short_title: string }[]
		)
	};
}

function kebab_to_capital(str: string) {
	return str
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}
