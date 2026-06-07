import { sveltekit } from '@sveltejs/kit/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import adapter from '@sveltejs/adapter-vercel';
import type { PluginOption, UserConfig } from 'vite';
import { browserslistToTargets } from 'lightningcss';
import browserslist from 'browserslist';
import { VERSION } from '@sveltejs/kit';

const plugins: PluginOption[] = [
	enhancedImages(),
	// apply cross-origin isolation headers for tutorial when developing/previewing locally,
	// else web containers don't work and images don't load in the rollup iframe
	{
		name: 'cross-origin-isolation-for-preview',
		configurePreviewServer: (server) => {
			server.middlewares.use((req, res, next) => {
				if (req.url?.startsWith('/tutorial/kit')) {
					res.setHeader('cross-origin-opener-policy', 'same-origin');
					res.setHeader('cross-origin-embedder-policy', 'require-corp');
					res.setHeader('cross-origin-resource-policy', 'cross-origin');
				}
				next();
			});
		},
		configureServer: (server) => {
			server.middlewares.use((req, res, next) => {
				if (req.url?.startsWith('/tutorial/kit')) {
					res.setHeader('cross-origin-opener-policy', 'same-origin');
					res.setHeader('cross-origin-embedder-policy', 'require-corp');
					res.setHeader('cross-origin-resource-policy', 'cross-origin');
				}
				next();
			});
		}
	},
	sveltekit({
		adapter: adapter(),

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
		},

		// TODO: remove this when we stop deploying previews for Kit 2
		experimental:
			VERSION[0] === '2'
				? {
						// @ts-expect-error this is invalid in Kit 3 but valid in Kit 2
						explicitEnvironmentVariables: true
					}
				: undefined
	}) as PluginOption
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
		cssMinify: 'lightningcss',
		rollupOptions: {
			output: {
				banner: (chunk) => {
					// this monstrosity is required for twoslash (which uses `require`) to work during prerendering.
					// it is brittle and may not work in perpetuity but i'm not sure what a better solution would be
					if (chunk.type === 'chunk' && chunk.name === 'renderer') {
						return `import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);`;
					}

					return '';
				}
			}
		}
	},
	server: {
		fs: { allow: ['../../packages', '../../node_modules', '../../../KIT/kit/packages/kit'] },
		// for SvelteKit tutorial
		headers: {
			'cross-origin-opener-policy': 'same-origin',
			'cross-origin-embedder-policy': 'require-corp',
			'cross-origin-resource-policy': 'cross-origin'
		}
	},
	optimizeDeps: {
		exclude: [
			'@sveltejs/site-kit',
			'flexsearch',
			// these are used by the REPL
			'@sveltejs/acorn-typescript',
			'@rollup/browser',
			'acorn',
			'magic-string',
			'resolve.exports',
			'tarparser',
			'zimmerframe',
			'esrap',
			'esrap/languages/ts',
			'tailwindcss'
		],
		include: ['@sveltejs/repl > @sveltejs/svelte-json-tree']
	},
	ssr: {
		noExternal: ['@sveltejs/site-kit', '@sveltejs/repl']
	},
	worker: {
		format: 'es'
	}
};

export default config;
