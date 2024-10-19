import { browser } from '$app/environment';
import { redirect } from '@sveltejs/kit';

export function load() {
	if (browser && location.hash.startsWith('#H4sIA')) {
		redirect(307, `/playground/untitled${location.hash}`);
	}
}
