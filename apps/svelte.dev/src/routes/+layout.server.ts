import { docs, index } from '$lib/server/content';
import { fetchBanner } from '@sveltejs/site-kit/components';
import type { NavigationLink } from '@sveltejs/site-kit';

const nav_links: NavigationLink[] = [
	{
		title: 'Docs',
		slug: 'docs',
		sections: Object.values(docs.topics)
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
		slug: 'tutorial',
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
		slug: 'playground'
	},
	{
		title: 'Blog',
		slug: 'blog'
	}
];

const sections: Record<string, string> = {
	docs: 'Docs',
	playground: 'Playground',
	blog: 'Blog',
	tutorial: 'Tutorial',
	search: 'Search'
};

export const load = async ({ url, fetch }) => {
	const banner = await fetchBanner('svelte.dev', fetch);
	const nav_title = sections[url.pathname.split('/')[1]!] ?? '';

	return {
		nav_title,
		nav_links,
		banner
	};
};
