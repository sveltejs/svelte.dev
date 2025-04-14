import { PACKAGES_META } from '$lib/packages-meta';
import { registry, type Package } from '$lib/server/content';
import {
	init,
	search,
	search_criteria,
	sort_packages,
	type SortCriterion
} from './packages-search';

export const prerender = false;

export async function load({ url }) {
	const query = url.searchParams.get('query');
	const svelte_versions = (url.searchParams.get('svelte_versions') ?? '')
		.split(',')
		.filter(Boolean)
		.reduce(
			(acc, val) => {
				acc[val] = true;
				return acc;
			},
			{} as Record<string, boolean>
		);
	const sort_by_param = url.searchParams.get('sort_by') as SortCriterion;

	const sort_by = search_criteria.includes(sort_by_param) ? sort_by_param : 'popularity';

	const packages_count = registry.length;

	// If query doesn't exist, we show netflix style page. For this, send pre-done cards with categories
	const homepage_data: { title: string; packages: Package[] }[] = [
		{
			title: 'sv add',
			packages: (
				PACKAGES_META.SV_ADD.packages
					.map((name) => registry.find((pkg) => pkg.name === name) ?? null)
					.filter((v) => Boolean(v)) as Package[]
			)
				.filter((v) => !v.outdated)
				.sort((a, b) => sort_packages(a, b, 'popularity'))
		}
	];
	for (const { packages, title, weights } of PACKAGES_META.FEATURED) {
		homepage_data.push({
			title,
			packages: (
				packages
					.map((name) => registry.find((pkg) => pkg.name === name) ?? null)
					.filter((v) => Boolean(v)) as Package[]
			)
				.filter((v) => !v.outdated)
				.sort((a, b) => sort_packages(a, b, 'popularity', weights))
		});
	}

	await init(registry);

	let current_results = query
		? await search(query, {
				sort_by,
				filters: {
					svelte_versions
				}
			})
		: [];

	return {
		packages: current_results,
		packages_count,
		homepage: homepage_data
	};
}
