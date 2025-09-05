import { PACKAGES_META } from './packages-meta';
import { registry, type Package } from '$lib/server/content';

export const prerender = false;

// Netflix style page. Send pre-done cards with categories
const homepage_data: { title: string; packages: Package[] }[] = [
	{
		title: 'sv add',
		packages: PACKAGES_META.SV_ADD.packages
			.map((name) => registry.find((pkg) => pkg.name === name) ?? null)
			.filter((v) => Boolean(v)) as Package[]
	}
];

for (const { packages, title } of PACKAGES_META.FEATURED) {
	homepage_data.push({
		title,
		packages: packages
			.map((name) => registry.find((pkg) => pkg.name === name) ?? null)
			.filter((v) => Boolean(v)) as Package[]
	});
}

export async function load({ url }) {
	return {
		packages: registry,
		homepage: homepage_data
	};
}
