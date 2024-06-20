import { get_examples_list } from '$lib/server/examples/index.js';
import examples_data from '$lib/generated/examples-data.js';
import { json } from '@sveltejs/kit';
import { blog_posts, index } from '$lib/server/content';
import type { NavigationLink } from '@sveltejs/site-kit';

export const prerender = true;

export const GET = async () => {
	return json(await get_nav_list());
};

async function get_nav_list(): Promise<NavigationLink[]> {
	const processed_docs_list: NavigationLink['sections'] = index.docs.children.map((topic) => ({
		title: topic.metadata.title,
		sections: topic.children.map((section) => ({
			title: section.metadata.title,
			sections: section.children.map((page) => ({
				title: page.metadata.title,
				path: '/docs/' + page.slug
			}))
		}))
	}));

	const processed_blog_list = [
		{
			title: '',
			sections: blog_posts.map(({ title, slug, date }) => ({
				title,
				path: '/blog/' + slug,
				// Put a NEW badge on blog posts that are less than 14 days old
				badge: (+new Date() - +new Date(date)) / (1000 * 60 * 60 * 24) < 14 ? 'NEW' : undefined
			}))
		}
	];

	// const examples_list = get_examples_list(examples_data);
	// const processed_examples_list = examples_list
	// 	.map(({ title, examples }) => ({
	// 		title,
	// 		sections: examples.map(({ title, slug }) => ({ title, path: '/examples/' + slug }))
	// 	}))
	// 	.filter(({ title }) => title !== 'Embeds');

	return [
		{
			title: 'Docs',
			prefix: 'docs',
			pathname: '/docs',
			sections: processed_docs_list
		},
		{
			title: 'Tutorial',
			prefix: 'tutorial',
			pathname: '/tutorial',
			sections: [
				{
					title: 'TUTORIAL',
					sections: [] //processed_examples_list
				}
			]
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
					sections: processed_blog_list
				}
			]
		}
	];
}
