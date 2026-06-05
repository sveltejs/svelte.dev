import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit()],

	resolve: {
		alias: {
			'$app/environment': '$app/env'
		}
	},

	server: {
		fs: {
			strict: false
		}
	}
};

export default config;
