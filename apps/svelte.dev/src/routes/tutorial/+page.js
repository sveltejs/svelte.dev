import { redirect } from '@sveltejs/kit';

export const prerender = true;

export function load() {
	redirect(307, '/tutorial/welcome-to-svelte');
}
