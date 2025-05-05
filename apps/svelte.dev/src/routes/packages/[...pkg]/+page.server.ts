import { registry } from '$lib/server/content';
import { render_content } from '$lib/server/renderer.js';
import { error } from '@sveltejs/kit';

export const prerender = true;

export async function load({ params }) {
	const pkg = registry.find((pkg) => pkg.name === params.pkg);
	if (!pkg) error(404, 'Package not found');

	pkg.readme = pkg.readme
		? await render_content('README.md', pkg.readme, {
				check: false,
				allow_diffs: true
			})
		: '';

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
