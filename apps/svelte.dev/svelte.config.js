import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter(),
		prerender: {
			// TODO remporary while not all docs are migrated
			handleHttpError({ path }) {
				return path === '/docs/service-workers' || path === '/docs/server-only-modules'
					? 'warn'
					: 'fail';
			},
			handleMissingId: 'warn'
		}
	}
};

export default config;
