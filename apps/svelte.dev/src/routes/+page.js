import { browser } from '$app/environment';
import { redirect } from '@sveltejs/kit';

export function load() {
	// redirect old svelte-5-preview.vercel.app playground links,
	// which all have a hash that starts with this pattern
	if (browser && location.hash.startsWith('#H4sIA')) {
		redirect(307, `/playground/untitled${location.hash}`);
	}
}
