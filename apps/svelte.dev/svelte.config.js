import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter(),
		prerender: {
			handleHttpError(error) {
				if (error.status === 500) {
					throw new Error(error.message);
				}

				// TODO fail the build
				console.error(`404 ${error.path}`);
			},
			handleMissingId(warning) {
				if (warning.id.startsWith('H4sIA')) {
					// playground link — do nothing
					return;
				}

				// TODO fail the build
				console.warn(`${warning.path}#${warning.id}: ${warning.referrers.join(', ')}`);
			}
		}
	}
};

export default config;
