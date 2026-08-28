import { sveltekit } from '@sveltejs/kit/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import adapter from '@sveltejs/adapter-vercel';
import type { PluginOption, UserConfig } from 'vite';
import { browserslistToTargets } from 'lightningcss';
import browserslist from 'browserslist';
import { VERSION } from '@sveltejs/kit';

const is_kit_2 = VERSION[0] === '2';

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

		files: is_kit_2 ? { params: 'src/params-legacy.js' } : undefined,

		inlineStyleThreshold: 1000,

		paths:
			// TODO: remove this when we stop deploying previews for Kit 2
			!is_kit_2
				? {
						// use deployment URL for prerender origin, so that preview environments also have the correct links
						origin: process.env.VERCEL_URL
							? `https://${process.env.VERCEL_URL}`
							: 'https://svelte.dev'
					}
				: undefined,

		prerender: {
			handleHttpError({ referrer, referenceType, message }) {
				// TODO: we need a better default in SvelteKit, otherwise the error message is too ambiguous
				throw new Error(`${message} when ${referenceType} by ${referrer}`);
			},
			handleMissingId(warning) {
				if (warning.id.startsWith('H4sIA')) {
					// playground link — do nothing
					return;
				}

				throw new Error(warning.message);
			},
			// TODO: remove this when we stop deploying previews for Kit 2
			...(is_kit_2
				? {
						origin: process.env.VERCEL_URL
							? `https://${process.env.VERCEL_URL}`
							: 'https://svelte.dev'
					}
				: {})
		},

		// TODO: remove this when we stop deploying previews for Kit 2
		experimental: is_kit_2
			? {
					// @ts-expect-error this is invalid in Kit 3 but valid in Kit 2
					explicitEnvironmentVariables: true
				}
			: undefined
	}) as PluginOption
];

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
		fs: { allow: ['../../packages', '../../node_modules', '../../../KIT/kit/packages/kit'] },
		// sync-docs copies these source files to content/docs, which is the only version Vite should watch
		watch: { ignored: ['**/repos/**'] },
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
