import type { Package } from '$lib/server/content';

const SV_ADD = {
	packages: [
		'drizzle-orm',
		'eslint',
		'lucia',
		'mdsvex',
		'@inlang/paraglide-js',
		'playwright',
		'prettier',
		'storybook',
		'tailwindcss',
		'vite-plugin-devtools-json',
		'vitest'
	],
	alias: {
		'@inlang/paraglide-js': 'paraglidejs',
		'drizzle-orm': 'drizzle',
		'vite-plugin-devtools-json': 'devtools-json'
	}
};

const FEATURED: { title: string; packages: string[]; weights?: Record<string, number> }[] = [
	{
		title: 'Component libraries',
		packages: [
			'shadcn-svelte',
			'bits-ui',
			'@melt-ui/svelte',
			'@skeletonlabs/skeleton',
			'@ark-ui/svelte',
			'flowbite-svelte',
			'svelte-material-ui',
			'carbon-components-svelte',
			'@sveltestrap/sveltestrap',
			'daisyui'
		],
		weights: {
			'shadcn-svelte': 2
		}
	},
	{
		title: 'Individual components',
		packages: [
			'@tanstack/svelte-table',
			'@ai-sdk/svelte',
			'svelte-moveable',
			'@tanstack/svelte-virtual',
			'virtua',
			'@event-calendar/core',
			'svelte-chartjs'
		]
	},
	{
		title: 'SvelteKit adapters',
		packages: [
			'@sveltejs/adapter-node',
			'@sveltejs/adapter-vercel',
			'@sveltejs/adapter-auto',
			'@sveltejs/adapter-cloudflare',
			'@sveltejs/adapter-netlify',
			'svelte-kit-sst',
			'svelte-adapter-bun',
			'@slicemachine/adapter-sveltekit',
			'amplify-adapter',
			'svelte-adapter-deno',
			'svelte-adapter-appengine',
			'sveltekit-adapter-browser-extension',
			'svelte-adapter-azure-swa'
		]
	},
	{
		title: 'Icons',
		packages: [
			'@iconify/tailwind4',
			'@unocss/preset-icons',
			'lucide-svelte',
			'svelte-awesome',
			'phosphor-svelte'
		]
	},
	{
		title: 'Router',
		packages: [
			'@sveltejs/kit',
			'svelte-routing',
			'svelte-micro',
			'@roxi/routify',
			'svelte-qparam',
			'@easyroute/svelte',
			'svelte5-router',
			'svelte-guard',
			'svelte-guard-history-router',
			'svelte-pathfinder',
			'elegua'
		]
	},
	{
		title: 'Data Visualization',
		packages: ['layercake', 'layerchart', 'svelte-maplibre', '@xyflow/svelte', 'svelte-maplibre-gl']
	},
	{
		title: '3D Rendering',
		packages: ['@threlte/core', 'svelte-zdog']
	},
	{
		title: 'Animations',
		packages: [
			'@neoconfetti/svelte',
			'svelte-motion',
			'@lottiefiles/svelte-lottie-player',
			'@tsparticles/svelte'
		]
	},
	{
		title: 'Content',
		packages: [
			'mdsvex',
			'svelte-markdown',
			'@content-collections/core',
			'carta-md',
			'typewriter-editor',
			'@svelte-put/toc',
			'@prismicio/svelte',
			'@svelteness/kit-docs',
			'@evidence-dev/evidence',
			'@magidoc/plugin-svelte-marked',
			'svelte-exmarkdown',
			'svelte-pdf'
		]
	},
	{
		title: 'Bundler plugins',
		packages: [
			'@sveltejs/vite-plugin-svelte',
			'rollup-plugin-svelte',
			'svelte-loader',
			'esbuild-svelte'
		]
	},
	{
		title: 'Media',
		packages: [
			'@sveltejs/enhanced-img',
			'@vime/svelte',
			'@uppy/svelte',
			'@unpic/svelte',
			'unlazy-svelte',
			'scrolly-video',
			'@zerodevx/svelte-img',
			'svelte-easy-crop'
		]
	},
	{
		title: 'Data fetching',
		packages: [
			'@urql/svelte',
			'trpc-sveltekit',
			'sswr',
			'@tanstack/svelte-query',
			'@orpc/svelte-query',
			'houdini'
		]
	},
	{
		title: 'SEO',
		packages: ['svelte-meta-tags', '@sveltejs/amp', 'svelte-seo', 'super-sitemap', 'svead']
	},
	{
		title: 'Auth',
		packages: [
			'lucia',
			'@auth/sveltekit',
			'altcha',
			'svelte-session-manager',
			'clerk-sveltekit',
			'svelte-kit-sessions',
			'@supabase/auth-helpers-sveltekit',
			'@passlock/sveltekit'
		]
	},
	{
		title: 'Third party services',
		packages: [
			'@sentry/svelte',
			'@sentry/sveltekit',
			'svelte-stripe',
			'clerk-sveltekit',
			'@storyblok/svelte',
			'@inlang/paraglide-js'
		]
	},
	// {
	// 	title: 'Testing',
	// 	packages: [
	// 		'@testing-library/svelte',
	// 		'svelte-jester',
	// 		'@cypress/svelte',
	// 		'playwright',
	// 		'vitest'
	// 	]
	// },
	{
		title: 'Forms',
		packages: ['sveltekit-superforms', '@tanstack/svelte-form', 'formsnap', 'felte']
	}
];

const OFFICIAL = [
	/^@sveltejs\//,
	'prettier-plugin-svelte',
	'svelte',
	'svelte2tsx',
	'eslint-plugin-svelte',
	'sv',
	'svelte-loader',
	'rollup-plugin-svelte'
];
function is_official(pkg: string): boolean {
	for (const official of OFFICIAL) {
		if (official instanceof RegExp) {
			if (official.test(pkg)) return true;
			continue;
		}

		if (official === pkg) return true;
	}

	return false;
}

export const PACKAGES_META = {
	is_official,
	FEATURED,
	SV_ADD
};
