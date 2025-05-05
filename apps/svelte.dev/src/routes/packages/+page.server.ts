import { PACKAGES_META } from '$lib/packages-meta';
import {
	mini_registry,
	mini_searchable_data,
	registry,
	type MiniPackage,
	type Package
} from '$lib/server/content';
import { search, sort_downloads } from './search';

export const prerender = false;

// If query doesn't exist, we show netflix style page. For this, send pre-done cards with categories
const homepage_data: { title: string; packages: MiniPackage[] }[] = [
	{
		title: 'sv add',
		packages: (
			PACKAGES_META.SV_ADD.packages
				.map((name) => mini_registry.find((pkg) => pkg.name === name) ?? null)
				.filter((v) => Boolean(v)) as MiniPackage[]
		).sort(sort_downloads)
	}
];

for (const { packages, title } of PACKAGES_META.FEATURED) {
	homepage_data.push({
		title,
		packages: (
			packages
				.map((name) => mini_registry.find((pkg) => pkg.name === name) ?? null)
				.filter((v) => Boolean(v)) as MiniPackage[]
		).sort(sort_downloads)
	});
}

export async function load({ url }) {
	const query = url.searchParams.get('query') ?? '';
	const svelte_versions = url.searchParams.get('svelte_versions') ?? '';

	const qps = {
		query: query ?? '',
		svelte_versions: (svelte_versions?.split(',') ?? []).reduce((acc, v) => {
			acc[v] = true;
			return acc;
		}, {} as any)
	};

	const mini_registry = registry.map(mini_searchable_data);

	const results = search(mini_registry, qps.query, qps.svelte_versions);

	return {
		total_packages: registry.length,
		results,
		homepage: homepage_data
	};
}
