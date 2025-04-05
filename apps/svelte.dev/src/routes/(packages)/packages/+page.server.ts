import { registry, type Package } from '$lib/server/content';
import { redirect } from '@sveltejs/kit';
import { PACKAGES_META } from '$lib/packages-meta';
import {
	init,
	REGISTRY_PAGE_LIMIT,
	search,
	search_criteria,
	sort_packages,
	type SortCriterion
} from './packages-search';

export const prerender = false;

export async function load({ url }) {
	const query = url.searchParams.get('query');
	let page = Math.max(1, +(url.searchParams.get('page')?.toString() ?? 1));
	const svelte_5_only = (url.searchParams.get('svelte_5_only') ?? 'false') === 'true';
	const hide_outdated = (url.searchParams.get('hide_outdated') ?? 'false') === 'true';
	const sort_by_param = url.searchParams.get('sort_by') as SortCriterion;

	const sort_by = search_criteria.includes(sort_by_param) ? sort_by_param : 'popularity';

	const packages_count = registry.length;

	// If query doesn't exist, we show netflix style page. For this, send pre-done cards with categories
	let homepage_data: { title: string; packages: Package[] }[] | null = null;
	if (!query) {
		homepage_data = [];
		for (const { packages, title, weights } of PACKAGES_META.FEATURED) {
			homepage_data.push({
				title,
				packages: (
					packages
						.map((name) => registry.find((pkg) => pkg.name === name) ?? null)
						.filter((v) => Boolean(v)) as Package[]
				).sort((a, b) => sort_packages(a, b, 'popularity', weights))
			});
		}

		return {
			homepage: homepage_data,
			packages_count
		};
	}

	init(registry);

	let current_results = search(query, {
		sort_by,
		filters: {
			svelte_5_only,
			hide_outdated
		}
	});

	const total_pages = Math.ceil(current_results.length / REGISTRY_PAGE_LIMIT);

	if (page > total_pages && total_pages !== 0) {
		page = 1;

		const new_url = new URL(url);
		new_url.searchParams.set('page', page + '');
		redirect(303, new_url);
	}

	const current_results_paged = current_results.slice(
		(page - 1) * REGISTRY_PAGE_LIMIT,
		(page - 1) * REGISTRY_PAGE_LIMIT + REGISTRY_PAGE_LIMIT
	);

	return {
		registry: current_results_paged,
		pages: {
			total_pages: Math.ceil(current_results.length / REGISTRY_PAGE_LIMIT)
		},
		packages_count
	};
}
