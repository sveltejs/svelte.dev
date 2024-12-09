import { index, remove_section } from '$lib/server/content';
import { error, redirect } from '@sveltejs/kit';

// All links to warnings/errors from the Svelte compiler/runtime go through this page in order to have stable references
// (i.e. we can move codes between warnings/errors/different pages or even adjust codes without breaking links).
const reference = index['docs/svelte/reference'].children.filter(
	(child) => child.slug.endsWith('-errors') || child.slug.endsWith('-warnings')
);

export const prerender = true;

export function entries() {
	return reference.flatMap((page) =>
		[...page.body.matchAll(/(^|\n)### (\w+)/g)].map(([, , code]) => ({ code }))
	);
}

export function load({ params }) {
	// Since codes are not top level section we gotta jump through some hoops to get the right hash
	for (const page of reference) {
		const idx = page.body.indexOf(`### ${params.code}`);
		if (idx === -1) continue;

		const slug_idx = page.body.lastIndexOf('\n## ', idx);

		if (slug_idx > 0 || page.body.startsWith(`## `)) {
			const title = page.body.slice(slug_idx + 4, page.body.indexOf('\n', slug_idx + 4)).trim();
			const slug = page.sections.find((s) => s.title === title)?.slug;

			if (!slug) {
				throw new Error(
					`Internal Error: Could not find previous title for code ${params.code} on ${page.slug}`
				);
			}

			redirect(307, `/${remove_section(page.slug)}#${slug}-${params.code}`);
		} else {
			redirect(307, `/${remove_section(page.slug)}#${params.code}`);
		}
	}

	error(404, 'Not found');
}
