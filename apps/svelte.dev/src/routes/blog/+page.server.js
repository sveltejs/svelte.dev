import { get_blog_data, get_blog_list } from '$lib/server/blog/index.js';

export const prerender = false; // TODO

export async function load() {
	return {
		posts: get_blog_list(await get_blog_data())
	};
}
