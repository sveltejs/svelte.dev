import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit({
			version: {
				// ideally, this should be something deterministic
				// like the output of `git rev-parse HEAD`
				name: Date.now().toString(),

				// use a short interval for this demo instead of the one-hour default
				pollInterval: 5000
			}
		})
	]
});
