const SV_ADD = {
	// Keeping the same order as in sv
	// https://github.com/sveltejs/cli/blob/main/packages/addons/_config/official.ts#L16-L17
	packages: [
		'prettier',
		'eslint',
		'vitest',
		'playwright',
		'tailwindcss',
		'vite-plugin-devtools-json',
		'drizzle-orm',
		'lucia',
		'mdsvex',
		'@inlang/paraglide-js',
		'storybook'
	]
};

const SV_ADD_CMD: Record<string, { alias: string; options?: string }> = {
	prettier: { alias: 'prettier' },
	eslint: { alias: 'eslint' },
	vitest: { alias: 'vitest' },
	playwright: { alias: 'playwright' },
	tailwindcss: { alias: 'tailwindcss' },
	'vite-plugin-devtools-json': { alias: 'devtools-json' },
	'drizzle-orm': { alias: 'drizzle' },
	lucia: { alias: 'lucia' },
	mdsvex: { alias: 'mdsvex' },
	'@inlang/paraglide-js': { alias: 'paraglide' },
	storybook: { alias: 'storybook' },

	'@sveltejs/adapter-node': { alias: 'sveltekit-adapter', options: 'adapter:node' },
	'@sveltejs/adapter-vercel': { alias: 'sveltekit-adapter', options: 'adapter:vercel' },
	'@sveltejs/adapter-auto': { alias: 'sveltekit-adapter', options: 'adapter:auto' },
	'@sveltejs/adapter-cloudflare': { alias: 'sveltekit-adapter', options: 'adapter:cloudflare' },
	'@sveltejs/adapter-netlify': { alias: 'sveltekit-adapter', options: 'adapter:netlify' }
};

const FEATURED: {
	title: string;
	description?: string;
	packages: string[];
}[] = [
	{
		title: 'Component libraries',
		packages: [
			'shadcn-svelte',
			'bits-ui',
			'melt',
			'@skeletonlabs/skeleton',
			'@ark-ui/svelte',
			'flowbite-svelte',
			'svelte-material-ui',
			'carbon-components-svelte',
			'@sveltestrap/sveltestrap',
			'daisyui'
		]
	},
	{
		title: 'Individual components',
		packages: [
			'@tanstack/svelte-table',
			'@ai-sdk/svelte',
			'svelte-moveable',
			'@tanstack/svelte-virtual',
			'virtua',
			'@event-calendar/core'
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
		title: 'Data visualization',
		packages: [
			'layercake',
			'layerchart',
			'svelte-maplibre',
			'svelte-chartjs',
			'@xyflow/svelte',
			'svelte-maplibre-gl'
		]
	},
	{
		title: '3D rendering',
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
		title: 'SEO',
		packages: ['svelte-meta-tags', '@sveltejs/amp', 'svelte-seo', 'super-sitemap', 'svead']
	},
	{
		title: 'Auth',
		packages: [
			'better-auth',
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
	{
		title: 'Testing and devtools',
		packages: [
			'@testing-library/svelte',
			'playwright',
			'vitest',
			'svelte-inspect',
			'svelte-render-scan'
		]
	},
	{
		title: 'Router',
		description: 'SvelteKit is recommended, but here are some alternatives.',
		packages: [
			'@sveltejs/kit',
			'svelte-routing',
			'@roxi/routify',
			'svelte5-router',
			'svelte-pathfinder',
			'universal-router'
		]
	},
	{
		title: 'Data fetching',
		description: 'SvelteKit remote functions are recommended, but here are some alternatives.',
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
		title: 'Forms',
		description: 'SvelteKit forms are recommended, but here are some alternatives.',
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
	SV_ADD,
	SV_ADD_CMD
};
