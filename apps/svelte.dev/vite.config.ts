import { sveltekit } from '@sveltejs/kit/vite';
import type { PluginOption, UserConfig } from 'vite';

const plugins: PluginOption[] = [sveltekit()];

// Only enable sharp if we're not in a webcontainer env
if (!process.versions.webcontainer) {
	plugins.push(
		(await import('vite-imagetools')).imagetools({
			defaultDirectives: (url) => {
				if (url.searchParams.has('big-image')) {
					return new URLSearchParams('w=640;1280;2560;3840&format=avif;webp;png&as=picture');
				}

				return new URLSearchParams();
			}
		})
	);
}

const config: UserConfig = {
	plugins,
	server: { fs: { allow: ['../../packages'] } },
	optimizeDeps: {
		exclude: ['@sveltejs/site-kit', '@sveltejs/repl', '@rollup/browser']
	},
	ssr: { noExternal: ['@sveltejs/site-kit', '@sveltejs/repl'] }
};

export default config;
