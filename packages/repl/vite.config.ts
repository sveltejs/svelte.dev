import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	ssr: {
		noExternal: ['@sveltejs/site-kit', '@sveltejs/repl']
	},
	worker: {
		format: 'es'
	}
});
