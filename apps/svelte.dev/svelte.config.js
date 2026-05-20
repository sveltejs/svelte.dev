import process from 'node:process';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		inlineStyleThreshold: 1000,

		prerender: {
			// use deployment URL for prerender origin, so that preview environments also have the correct links
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
