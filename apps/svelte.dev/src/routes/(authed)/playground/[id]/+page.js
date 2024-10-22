import { browser } from '$app/environment';
import { redirect } from '@sveltejs/kit';

export function load() {
	// redirect old svelte-5-preview.vercel.app playground links,
	// which all have a hash that starts with this pattern
	if (browser) {
		if (location.hash) {
			redirect(307, `https://svelte.dev/${location.pathname}#${location.hash}`);
		} else {
			redirect(307, `https://svelte.dev/${location.pathname}`);
		}
	}
}
