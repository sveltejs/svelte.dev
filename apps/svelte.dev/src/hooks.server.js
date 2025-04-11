import { redirect } from '@sveltejs/kit';

const mappings = new Map([
	// docs
	['/docs/accessibility-warnings', '/docs/svelte/compiler-warnings'],
	['/docs/basic-markup', '/docs/svelte/basic-markup'],
	['/docs/client-side-component-api', '/docs/svelte/legacy-component-api'],
	['/docs/custom-elements-api', '/docs/svelte/custom-elements'],
	['/docs/introduction', '/docs/svelte/overview'],
	['/docs/server-side-component-api', '/docs/svelte/legacy-component-api'],
	['/docs/special-tags', '/docs/svelte/basic-markup'],
	// ['/docs/svelte', '/docs/svelte/svelte'], - can't map this. /docs/svelte is now a redirect to the overview page
	['/docs/svelte-action', '/docs/svelte/svelte-action'],
	['/docs/svelte-animate', '/docs/svelte/svelte-animate'],
	['/docs/svelte-compiler', '/docs/svelte/svelte-compiler'],
	['/docs/svelte-components', '/docs/svelte/svelte-files'],
	['/docs/svelte-easing', '/docs/svelte/svelte-easing'],
	['/docs/svelte-motion', '/docs/svelte/svelte-motion'],
	[
		'/docs/svelte-register',
		'https://github.com/sveltejs/svelte/blob/svelte-4/documentation/docs/06-legacy/01-svelte-register.md'
	],
	['/docs/svelte-store', '/docs/svelte/svelte-store'],
	['/docs/svelte-transition', '/docs/svelte/svelte-transition'],
	['/docs/typescript', '/docs/svelte/typescript'],
	['/docs/v4-migration-guide', '/docs/svelte/v4-migration-guide'],
	['/faq', '/docs/svelte/faq'],
	// tutorial
	['/tutorial/reactive-assignments', '/tutorial/svelte/state'],
	['/tutorial/reactive-declarations', '/tutorial/svelte/derived-state'],
	['/tutorial/reactive-statements', '/tutorial/svelte/effects'],
	['/tutorial/updating-arrays-and-objects', '/tutorial/svelte/deep-state'],
	['/tutorial/event-modifiers', '/tutorial/svelte/capturing'],
	['/tutorial/dom-event-forwarding', '/tutorial/svelte/spreading-events'],
	['/tutorial/svelte/introducing-stores', '/tutorial/svelte/stores'],
	['/tutorial/kit/app-store', '/tutorial/kit/app-state'],
	['/tutorial/kit/navigating-store', '/tutorial/kit/navigating-state'],
	['/tutorial/kit/updated-store', '/tutorial/kit/updated-state']
]);

// selectively preload fonts
const fonts = [
	'dm-serif-display-latin-400-normal',
	'eb-garamond-latin-400-normal',
	'fira-sans-latin-400-normal'
];

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	// Best effort to redirect from Svelte 4 docs to new docs
	const destination = mappings.get(event.url.pathname);
	if (destination) {
		// TODO: change to `dev ? 307 : 308` if no reports of incorrect redirects
		// (update: should we ever? We would prohibit us from ever changing that structure later on)
		redirect(307, destination);
	}

	// For REPL. For some reason, the repl/+page.server.ts file is not working, so
	// we are doing the redirect here
	if (event.url.pathname.startsWith('/repl')) {
		redirect(307, event.url.pathname.replace('/repl', '/playground'));
	}

	// For examples
	if (event.url.pathname.startsWith('/examples')) {
		redirect(307, event.url.pathname.replace('/examples', '/playground'));
	}

	// Best effort to redirect from Svelte 3 tutorial to new tutorial
	if (event.url.pathname.startsWith('/tutorial/') && event.url.pathname.split('/').length === 2) {
		redirect(307, event.url.pathname.replace('/tutorial/', '/tutorial/svelte/'));
	}

	const response = await resolve(event, {
		preload: ({ type, path }) => {
			if (type === 'font') {
				if (!path.endsWith('.woff2')) return false;
				return fonts.some((font) => path.includes(font));
			}

			return type === 'js' || type === 'css'; // future-proof, if we add `assets` later
		}
	});

	return response;
}
