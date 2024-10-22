import { redirect } from '@sveltejs/kit';

const mappings = new Map([
	['/docs/svelte-components', '/docs/svelte/svelte-files'],
	['/docs/logic-blocks', '/docs/svelte/control-flow'],
	['/docs/special-tags', '/docs/svelte/basic-markup'], // TODO: find a new home for some of these?
	['/docs/element-directives', '/docs/svelte/basic-markup'],
	['/docs/component-directives', '/docs/svelte/svelte-files'],
	['/docs/custom-elements-api', '/docs/svelte/custom-elements'],
	['/docs/accessibility-warnings', '/docs/svelte/compiler-warnings']
]);

// selectively preload fonts
const fonts = [
	'dm-serif-display-latin-400-normal',
	'eb-garamond-latin-400-normal',
	'fira-sans-latin-400-normal'
];

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	if (!event.url.pathname.startsWith('/playground')) {
		redirect(301, 'https://svelte.dev/' + event.url.pathname);
	}

	return resolve(event);
}
