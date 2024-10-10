import { docs as _docs, index } from '$lib/server/content';
import { fetchBanner } from '@sveltejs/site-kit/components';
import type { NavigationLink } from '@sveltejs/site-kit';

const nav_links: NavigationLink[] = [
	{
		title: 'Docs',
		prefix: 'docs',
		pathname: '/docs',
		sections: Object.values(_docs.topics)
			.map((topic) => ({
				title: topic.metadata.title,
				path: '/' + topic.slug, // this will make the UI show a flyout menu for the docs nav entry
				sections: topic.children.map((section) => ({
					title: section.metadata.title,
					sections: section.children.map((page) => ({
						title: page.metadata.title,
						path: '/' + page.slug
					}))
				}))
			}))
			.sort((a, b) => a.title.localeCompare(b.title)) // Svelte first
	},
	{
		title: 'Tutorial',
		prefix: 'tutorial',
		pathname: '/tutorial',
		sections: index.tutorial.children.map((topic) => ({
			title: topic.metadata.title,
			sections: topic.children.map((section) => ({
				title: section.metadata.title,
				sections: section.children.map((page) => ({
					title: page.metadata.title,
					path: '/tutorial/' + page.slug.split('/').pop()
				}))
			}))
		}))
	},
	{
		title: 'Playground',
		prefix: 'playground',
		pathname: '/playground'
	},
	{
		title: 'Blog',
		prefix: 'blog',
		pathname: '/blog'
	}
];

export const load = async ({ url, fetch }) => {
	const banner = await fetchBanner('svelte.dev', fetch);

	return {
		nav_title: get_nav_title(url),
		nav_links,
		banner
	};
};

function get_nav_title(url: URL) {
	const list = new Map([
		[/^docs/, 'Docs'],
		[/^playground/, 'Playground'],
		[/^blog/, 'Blog'],
		[/^faq/, 'FAQ'],
		[/^tutorial/, 'Tutorial'],
		[/^search/, 'Search'],
		[/^examples/, 'Examples']
	]);

	for (const [regex, title] of list) {
		if (regex.test(url.pathname.replace(/^\/(.+)/, '$1'))) {
			return title;
		}
	}

	return '';
}
