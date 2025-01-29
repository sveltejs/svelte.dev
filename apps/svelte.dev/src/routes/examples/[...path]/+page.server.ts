import { redirect } from '@sveltejs/kit';

export const prerender = false;

export function load({ url }) {
	redirect(307, url.href.replace('/examples', '/playground'));
}
