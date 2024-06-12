import { sveltekit } from '@sveltejs/kit/vite';
import type { PluginOption, UserConfig } from 'vite';
import { browserslistToTargets } from 'lightningcss';
import browserslist from 'browserslist';

const plugins: PluginOption[] = [
	// apply cross-origin isolation headers for tutorial when previewing locally
	{
		name: 'cross-origin-isolation-for-preview',
		configurePreviewServer: (server) => {
			server.middlewares.use((_, res, next) => {
				res.setHeader('cross-origin-opener-policy', 'same-origin');
				res.setHeader('cross-origin-embedder-policy', 'require-corp');
				res.setHeader('cross-origin-resource-policy', 'cross-origin');
				next();
			});
		}
	},
	sveltekit() as PluginOption
];

// Only enable sharp if we're not in a webcontainer env
if (!process.versions.webcontainer) {
	plugins.push(
		(await import('vite-imagetools')).imagetools({
			exclude: 'content/**',
			defaultDirectives: (url) => {
				if (url.searchParams.has('big-image')) {
					return new URLSearchParams('w=640;1280;2560;3840&format=avif;webp;png&as=picture');
				}

				return new URLSearchParams();
			}
		}) as PluginOption
	);
}

const config: UserConfig = {
	plugins,
	css: {
		transformer: 'lightningcss',
		lightningcss: {
			targets: browserslistToTargets(browserslist(['>0.2%', 'not dead']))
		}
	},
	build: {
		cssMinify: 'lightningcss'
	},
	server: {
		fs: { allow: ['../../packages'] },
		// for tutorial
		headers: {
			'cross-origin-opener-policy': 'same-origin',
			'cross-origin-embedder-policy': 'require-corp',
			'cross-origin-resource-policy': 'cross-origin'
		}
	},
	optimizeDeps: {
		exclude: ['@sveltejs/site-kit', '@sveltejs/repl', '@rollup/browser']
	},
	ssr: { noExternal: ['@sveltejs/site-kit', '@sveltejs/repl'] }
};

export default config;
