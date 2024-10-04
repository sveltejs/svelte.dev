import { json } from '@sveltejs/kit';
import { docs as _docs, index } from '$lib/server/content';
import type { NavigationLink } from '@sveltejs/site-kit';

export const prerender = true;

export const GET = async () => {
	return json(await get_nav_list());
};

async function get_nav_list(): Promise<NavigationLink[]> {
	const docs = Object.values(_docs.topics)
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
		.sort((a, b) => a.title.localeCompare(b.title)); // Svelte first

	const tutorial = index.tutorial.children.map((topic) => ({
		title: topic.metadata.title,
		sections: topic.children.map((section) => ({
			title: section.metadata.title,
			sections: section.children.map((page) => ({
				title: page.metadata.title,
				path: '/tutorial/' + page.slug.split('/').pop()
			}))
		}))
	}));

	return [
		{
			title: 'Docs',
			prefix: 'docs',
			pathname: '/docs',
			sections: docs
		},
		{
			title: 'Tutorial',
			prefix: 'tutorial',
			pathname: '/tutorial',
			sections: tutorial
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
}
