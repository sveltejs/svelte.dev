import { registry } from '$lib/server/content';
import { redirect } from '@sveltejs/kit';
import registry_json from '../../../lib/registry.json';
import { init, REGISTRY_PAGE_LIMIT, search } from '../packages-search';

export const prerender = false;

export async function load({ url }) {
	const query = url.searchParams.get('query');
	const tags = (url.searchParams.get('tags') ?? '').split(',').filter(Boolean);
	let page = Math.max(1, +(url.searchParams.get('page')?.toString() ?? 1));

	init(registry);

	const current_results = search(query, { tags, sort_by: 'popularity' });

	const total_pages = Math.ceil(current_results.length / REGISTRY_PAGE_LIMIT);
	console.log(page, total_pages);

	if (page > total_pages && total_pages !== 0) {
		page = 1;

		const new_url = new URL(url);
		new_url.searchParams.set('page', page + '');
		redirect(303, new_url);
	}

	const current_results_paged = current_results.slice(
		(page - 1) * REGISTRY_PAGE_LIMIT,
		(page - 1) * REGISTRY_PAGE_LIMIT + REGISTRY_PAGE_LIMIT
	);

	return {
		registry: current_results_paged,
		pages: {
			total_pages: Math.ceil(current_results.length / REGISTRY_PAGE_LIMIT)
		},
		tags: Object.entries(registry_json.tags)
			.reduce(
				(acc, [key, value]) => {
					if (value.title) {
						acc.push({
							tag: key,
							title: value.title,
							short_title:
								{
									ui: 'UI',
									dom: 'DOM',
									seo: 'SEO'
								}[key] ?? kebab_to_capital(key)
						});
					}
					return acc;
				},
				[] as { tag: string; title: string; short_title: string }[]
			)
			.sort((a, b) => a.tag.localeCompare(b.tag))
	};
}

function kebab_to_capital(str: string) {
	return str
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}
