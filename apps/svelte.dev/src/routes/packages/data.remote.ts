import { prerender } from '$app/server';
import { PACKAGES_META } from '$lib/packages-meta';
import { registry, type Category, type Package, type PackageDefinition } from '$lib/server/content';

const arrToPackages = (arr: PackageDefinition[]) => {
	return arr
		.map((pkgDef) => {
			const pkgFound = registry.find((pkg) => pkg.name === pkgDef.name) ?? null;
			if (pkgFound && pkgDef.svAlias) {
				const result = structuredClone(pkgFound);
				result.svAlias = pkgDef.svAlias;
				result.name = pkgDef.svAlias;
				result.homepage = `/docs/cli/${pkgDef.svAlias}`;
				delete result.repo_url;
				return result;
			}

			return pkgFound;
		})
		.filter((v) => Boolean(v)) as Package[];
};

// Netflix style page. Send pre-done cards with categories
const categories: Category[] = [];

for (const { packages, title, description } of PACKAGES_META.FEATURED) {
	categories.push({
		title,
		hash: title.toLowerCase().replace(/ /g, '-'),
		description,
		packages: arrToPackages(packages)
	});
}

export const get_packages = prerender(() => {
	return categories;
});
