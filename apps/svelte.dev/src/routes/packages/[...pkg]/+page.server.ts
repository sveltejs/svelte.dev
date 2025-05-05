import { registry } from '$lib/server/content';
import { error } from '@sveltejs/kit';

export const prerender = false;

export async function load({ params }) {
	const pkg = registry.find((pkg) => pkg.name === params.pkg);
	if (!pkg) error(404, 'Package not found');

	return {
		pkg
	};
}

export async function entries() {
	return registry.map((v) => {
		return {
			pkg: v.name
		};
	});
}
