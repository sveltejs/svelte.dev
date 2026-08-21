import { PRERENDER } from '$app/env/private';
import { docs, index } from '#lib/server/content.ts';
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
			docs.topics['docs/ai']
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
	},
	{
		title: 'Showcase',
		slug: 'showcase'
	}
];

const banner: BannerData = {
	id: 'ljubljana-2026-tickets',
	start: new Date('1 August, 2026 00:00:00 UTC'),
	end: new Date('20 November, 2026 23:59:59 UTC'),
	arrow: true,
	content: {
		lg: 'Svelte Summit Ljubljana and online, Nov 18-19: Tickets available soon!',
		sm: 'Svelte Summit Nov 18-19'
	},
	href: 'https://www.sveltesummit.com/'
};

export const load = async () => {
	return {
		nav_links,
		banner
	};
};
