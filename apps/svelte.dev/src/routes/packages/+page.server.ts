import { PACKAGES_META } from '$lib/packages-meta';
import { registry, type Package } from '$lib/server/content';

export const prerender = false;

const arrToPackages = (arr: string[]) => {
	return arr
		.map((name) => {
			const pkg = registry.find((pkg) => pkg.name === name) ?? null;
			if (pkg) {
				const cmd = PACKAGES_META.SV_ADD_CMD[pkg.name];
				if (cmd) {
					pkg.svCmdAlias = cmd.alias;
					pkg.svCmdOptions = cmd.options;
				}
			}

			return pkg;
		})
		.filter((v) => Boolean(v)) as Package[];
};

// Netflix style page. Send pre-done cards with categories
const addons: { title: string; href?: string; alternative?: string; packages: Package[] }[] = [
	{
		title: 'Svelte CLI add-ons',
		href: '/docs/cli',
		packages: arrToPackages(PACKAGES_META.SV_ADD.packages).map((pkg) => {
			pkg.name = pkg.svCmdAlias ?? pkg.name;
			pkg.homepage = `/docs/cli/${pkg.svCmdAlias}`;
			delete pkg.repo_url;
			return pkg;
		})
	}
];

const homepage: { title: string; href?: string; alternative?: string; packages: Package[] }[] = [];

for (const { packages, title, alternative } of PACKAGES_META.FEATURED) {
	homepage.push({
		title,
		alternative,
		packages: arrToPackages(packages)
	});
}

export async function load() {
	return {
		packages: registry,
		addons,
		homepage
	};
}
