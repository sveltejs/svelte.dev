import { PACKAGES_META } from '$lib/packages-meta';
import { registry, type Package } from '$lib/server/content';

export const prerender = false;

const arrToPackages = (arr: string[]) => {
	return arr
		.map((name) => {
			const pkg = registry.find((pkg) => pkg.name === name) ?? null;
			if (pkg) {
				pkg.main_url = pkg.homepage;
				const cmd = PACKAGES_META.SV_ADD_CMD[pkg.name];
				if (cmd) {
					pkg.svCmd = `npx sv add ${cmd.alias}${cmd.options ? `=${cmd.options}` : ''}`;
					pkg.main_url = `/docs/cli/${cmd.alias}`;
				}
			}

			return pkg;
		})
		.filter((v) => Boolean(v)) as Package[];
};

// Netflix style page. Send pre-done cards with categories
const homepage_data: { title: string; packages: Package[] }[] = [
	{
		title: 'sv add-ons',
		packages: arrToPackages(PACKAGES_META.SV_ADD.packages)
	}
];

for (const { packages, title } of PACKAGES_META.FEATURED) {
	homepage_data.push({
		title,
		packages: arrToPackages(packages)
	});
}

export async function load({ url }) {
	return {
		packages: registry,
		homepage: homepage_data
	};
}
