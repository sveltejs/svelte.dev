import { redirect } from '@sveltejs/kit';

const mappings = new Map([
	['/docs/accessibility-warnings', '/docs/svelte/compiler-warnings'],
	['/docs/component-directives', '/docs/svelte/svelte-files'],
	['/docs/custom-elements-api', '/docs/svelte/custom-elements'],
	['/docs/element-directives', '/docs/svelte/basic-markup'],
	['/docs/logic-blocks', '/docs/svelte/basic-markup'],
	['/docs/svelte-components', '/docs/svelte/svelte-files'],
	['/docs/special-tags', '/docs/svelte/basic-markup'],
	['/faq', '/docs/svelte/faq']
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
		redirect(307, destination);
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
