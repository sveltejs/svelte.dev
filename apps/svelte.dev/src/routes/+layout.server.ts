import { PRERENDER } from '$env/static/private';
import { docs, index } from '$lib/server/content';
import type { BannerData, NavigationLink } from '@sveltejs/site-kit';

// by default, all pages are prerendered
export const prerender = PRERENDER !== 'false';

const nav_links: NavigationLink[] = [
	{
		title: 'Docs',
		slug: 'docs',
		sections: [
			docs.topics['docs/svelte'],
			docs.topics['docs/kit'],
			docs.topics['docs/cli'],
			docs.topics['docs/mcp']
		].map((topic) => ({
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
					path:
						'/tutorial/' +
						(page.slug.includes('sveltekit/') ? 'kit' : 'svelte') +
						'/' +
						page.slug.split('/').pop()
				}))
			}))
		}))
	},
	{
		title: 'Packages',
		slug: 'packages'
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

const banner: BannerData = {
	id: 'barcelona-2025-tickets',
	start: new Date('21 April, 2025 00:00:00 UTC'),
	end: new Date('6 May, 2025 23:59:59 UTC'),
	arrow: true,
	content: {
		lg: 'Svelte Summit Barcelona and online, May 8-9: Last few days to get tickets!',
		sm: 'Svelte Summit May 8-9'
	},
	href: 'https://www.sveltesummit.com/'
};

export const load = async () => {
	return {
		nav_links,
		banner
	};
};
