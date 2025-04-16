import { PACKAGES_META } from '$lib/packages-meta';
import { registry, type Package } from '$lib/server/content';
import { sort_downloads } from './search';

export const prerender = false;

// If query doesn't exist, we show netflix style page. For this, send pre-done cards with categories
const homepage_data: { title: string; packages: Package[] }[] = [
	{
		title: 'sv add',
		packages: (
			PACKAGES_META.SV_ADD.packages
				.map((name) => registry.find((pkg) => pkg.name === name) ?? null)
				.filter((v) => Boolean(v)) as Package[]
		).sort(sort_downloads)
	}
];

for (const { packages, title } of PACKAGES_META.FEATURED) {
	homepage_data.push({
		title,
		packages: (
			packages
				.map((name) => registry.find((pkg) => pkg.name === name) ?? null)
				.filter((v) => Boolean(v)) as Package[]
		).sort(sort_downloads)
	});
}

export async function load({ url }) {
	return {
		packages: registry,
		homepage: homepage_data
	};
}
