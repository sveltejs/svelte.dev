import { json } from '@sveltejs/kit';
import { blog_posts, docs as _docs, index } from '$lib/server/content';
import type { NavigationLink } from '@sveltejs/site-kit';

export const prerender = true;

export const GET = async () => {
	return json(await get_nav_list());
};

async function get_nav_list(): Promise<NavigationLink[]> {
	const docs = Object.values(_docs.topics).map((topic) => ({
		title: topic.metadata.title,
		sections: topic.children.map((section) => ({
			title: section.metadata.title,
			sections: section.children.map((page) => ({
				title: page.metadata.title,
				path: '/' + page.slug
			}))
		}))
	}));

	const blog = [
		{
			title: '',
			sections: blog_posts.map(({ title, slug, date }) => ({
				title,
				path: '/' + slug,
				// Put a NEW badge on blog posts that are less than 14 days old
				badge: (+new Date() - +new Date(date)) / (1000 * 60 * 60 * 24) < 14 ? 'NEW' : undefined
			}))
		}
	];

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
			title: 'REPL',
			prefix: 'repl',
			pathname: '/repl'
		},
		{
			title: 'Blog',
			prefix: 'blog',
			pathname: '/blog',
			sections: [
				{
					title: 'BLOG',
					sections: blog
				}
			]
		}
	];
}
