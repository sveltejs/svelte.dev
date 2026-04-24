import process from 'node:process';
import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter(),

		inlineStyleThreshold: 1000,

		prerender: {
			origin: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://svelte.dev',

			handleMissingId(warning) {
				if (warning.id.startsWith('H4sIA')) {
					// playground link — do nothing
					return;
				}

				throw new Error(warning.message);
			}
		}
	}
};

export default config;
