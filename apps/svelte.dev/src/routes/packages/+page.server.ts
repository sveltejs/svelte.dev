import { PACKAGES_META } from '$lib/packages-meta';
import { registry, type Category, type Package } from '$lib/server/content';

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
const addons: Category[] = [
	{
		title: 'Svelte CLI add-ons',
		description:
			'<a href="/docs/cli">sv, the Svelte CLI</a>, lets you instantly add functionality to a new or existing project.',
		packages: arrToPackages(PACKAGES_META.SV_ADD.packages).map((pkg) => {
			const result = structuredClone(pkg);
			result.name = pkg.svCmdAlias ?? pkg.name;
			result.homepage = `/docs/cli/${pkg.svCmdAlias}`;
			delete result.repo_url;
			return result;
		})
	}
];

const homepage: Category[] = [];

for (const { packages, title, description } of PACKAGES_META.FEATURED) {
	homepage.push({
		title,
		description,
		packages: arrToPackages(packages)
	});
}

export async function load() {
	return {
		addons,
		homepage
	};
}
