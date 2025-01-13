import { remove_section } from '$lib/server/content';
import { error, redirect } from '@sveltejs/kit';

// All links to warnings/errors from the Svelte compiler/runtime go through this page in order to have stable references
// (i.e. we can move codes between warnings/errors/different pages or even adjust codes without breaking links).

// Right now we can't prerender this because we would hit a "too many routes" error on Vercel,
// for which we need to implement https://github.com/sveltejs/kit/issues/9032
// const reference = index['docs/svelte/reference'].children.filter(
// 	(child) => child.slug.endsWith('-errors') || child.slug.endsWith('-warnings')
// );
//
// export const prerender = true;
//
// export function entries() {
// 	return reference.flatMap((page) =>
// 		[...page.body.matchAll(/(^|\n)### (\w+)/g)].map(([, , code]) => ({ code }))
// 	);
// }
export const prerender = false;

export async function load({ params, fetch }) {
	const codes: Record<string, Record<string, string[]>> = await fetch('/e/tmp/codes.json').then(
		(r) => r.json()
	);

	for (const url of Object.keys(codes)) {
		const page = codes[url];
		for (const [h2, h3] of Object.entries(page)) {
			if (h3.includes(params.code)) {
				if (h2) {
					redirect(307, `/${remove_section(url)}#${h2}-${params.code}`);
				} else {
					redirect(307, `/${remove_section(url)}#${params.code}`);
				}
			}
		}
	}

	error(404, 'Not found');
}
