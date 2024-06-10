import { redirect } from '@sveltejs/kit';

// TODO reset this once we figure out what to do with the tutorial
export const prerender = false;

export function load() {
	redirect(301, '/tutorial/basics');
}
