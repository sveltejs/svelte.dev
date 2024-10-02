import { redirect } from '@sveltejs/kit';

const mappings = new Map([
	['/docs/getting-started', '/docs/svelte/getting-started'],
	['/docs/svelte-components', '/docs/svelte/component-fundamentals'],
	['/docs/basic-markup', '/docs/svelte/basic-markup'],
	['/docs/logic-blocks', '/docs/svelte/control-flow'],
	['/docs/special-tags', '/docs/svelte/basic-markup'], // TODO: find a new home for some of these?
	['/docs/element-directives', '/docs/svelte/basic-markup'],
	['/docs/component-directives', '/docs/svelte/component-fundamentals'],
	['/docs/special-elements', '/docs/svelte/special-elements'],
	['/docs/svelte-action', '/docs/svelte/svelte-action'],
	['/docs/svelte-motion', '/docs/svelte/svelte-motion'],
	['/docs/svelte-store', '/docs/svelte/svelte-store'],
	['/docs/svelte-transition', '/docs/svelte/svelte-transition'],
	['/docs/svelte-animate', '/docs/svelte/svelte-animate'],
	['/docs/svelte-easing', '/docs/svelte/svelte-easing'],
	['/docs/faq', '/docs/svelte/faq'],
	['/docs/accessibility-warnings', '/docs/svelte/accessibility-warnings'], // TODO: this doesn't exist yet
	['/docs/typescript', '/docs/svelte/typescript'],
	['/docs/custom-elements-api', '/docs/svelte/custom-elements'],
	['/docs/typescript', '/docs/svelte/typescript']
]);

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	// Best effort to redirect from Svelte 4 docs to new docs
	if (event.url.pathname.startsWith('/docs')) {
		const destination = mappings.get(event.url.pathname);
		if (destination) {
			redirect(307, destination); // TODO make 301 once we're sure
		}
	}

	const response = await resolve(event, {
		preload: ({ type }) => type === 'js' || type === 'css' || type === 'font'
	});

	return response;
}
