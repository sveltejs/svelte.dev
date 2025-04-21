import { PACKAGES_META } from '$lib/packages-meta';
import type { MiniPackage } from '$lib/server/content';

function escape(str: string) {
	return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
}

function sort_alphanumeric(a: MiniPackage, b: MiniPackage) {
	return a.name < b.name ? -1 : 1;
}

export function sort_downloads(a: MiniPackage, b: MiniPackage) {
	// TODO when would `downloads` be undefined?
	return (b.downloads ?? 0) - (a.downloads ?? 0);
}

export function search(packages: MiniPackage[], query: string, versions: string[]) {
	const pattern = escape(query);

	const exact = new RegExp(`\\b${pattern}\\b`, 'i');
	const partial = new RegExp(pattern, 'i');

	const exact_addons: MiniPackage[] = [];
	const exact_official: MiniPackage[] = [];
	const exact_unofficial: MiniPackage[] = [];

	const partial_addons: MiniPackage[] = [];
	const partial_official: MiniPackage[] = [];
	const partial_unofficial: MiniPackage[] = [];

	for (const pkg of packages) {
		if (versions.length > 0 && !versions.some((v) => pkg.svelte[v as '3' | '4' | '5'])) {
			continue;
		}

		if (exact.test(pkg.name) || exact.test(pkg.description!)) {
			if (PACKAGES_META.SV_ADD.packages.includes(pkg.name)) {
				// TODO put this metadata on the package object, not PACKAGES_META
				exact_addons.push(pkg);
			} else if (PACKAGES_META.is_official(pkg.name)) {
				// TODO ditto
				exact_official.push(pkg);
			} else {
				exact_unofficial.push(pkg);
			}
		} else if (partial.test(pkg.name) || partial.test(pkg.description!)) {
			if (PACKAGES_META.SV_ADD.packages.includes(pkg.name)) {
				// TODO put this metadata on the package object, not PACKAGES_META
				partial_addons.push(pkg);
			} else if (PACKAGES_META.is_official(pkg.name)) {
				// TODO ditto
				partial_official.push(pkg);
			} else {
				partial_unofficial.push(pkg);
			}
		}
	}

	exact_addons.sort(sort_alphanumeric);
	exact_official.sort(sort_downloads);
	exact_unofficial.sort(sort_downloads);

	partial_addons.sort(sort_alphanumeric);
	partial_official.sort(sort_downloads);
	partial_unofficial.sort(sort_downloads);

	const result = [
		...exact_addons,
		...exact_official,
		...exact_unofficial,
		...partial_addons,
		...partial_official,
		...partial_unofficial
	].slice(0, 100);

	return result;
}
