import { prerender } from '$app/server';
import { docs, index } from '$lib/server/content';
import type { NavigationLink, BannerData } from '@sveltejs/site-kit';

export const get_banner = prerender<BannerData | null>(() => null);

export const get_nav_links = prerender<NavigationLink[]>(() => {
	return [
		{
			title: 'Docs',
			slug: 'docs',
			sections: [docs.topics['docs/svelte'], docs.topics['docs/kit'], docs.topics['docs/cli']].map(
				(topic) => ({
					title: topic.metadata.title,
					path: '/' + topic.slug, // this will make the UI show a flyout menu for the docs nav entry
					sections: topic.children.map((section) => ({
						title: section.metadata.title,
						sections: section.children.map((page) => ({
							title: page.metadata.title,
							path: '/' + page.slug
						}))
					}))
				})
			)
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
});
