import type { Package } from './server/content';

const TAGS = {
	'design-system': {
		prompt:
			'MUST contain 2+ reusable Svelte components designed as a cohesive set with shared design principles. Examples: complete UI kits, design systems, form libraries, widget collections, component libraries. Key indicator: components are intentionally built to work together, share styling patterns, and serve a unified purpose. NOT a single component or unrelated components bundled together.'
	},
	ui: {
		prompt:
			'Individual visual Svelte components or styling tools focused on appearance. Examples: standalone UI elements (buttons, modals, dropdowns), animation libraries, transition effects, tooltips. Key indicator: primary purpose is enhancing visual presentation. NOT state management tools or multi-component systems that would qualify as design systems.'
	},
	router: {
		prompt:
			'Manages navigation and URL handling in Svelte apps. Examples: client-side routers, path matching utilities, navigation guards, route parameter parsers. Key indicator: primary purpose is handling application navigation flow and URL state. NOT page transition animations (ui tag) or general application state management.'
	},
	content: {
		prompt:
			'Tools for creating, processing, and rendering structured content in Svelte. Examples: Markdown/MDX processors, CMS connectors, blog frameworks, documentation generators. Key indicator: focused on content authoring, organization, or display. NOT general data fetching (server tag) or UI components (ui tag) unless specifically content-oriented.'
	},
	media: {
		prompt:
			'Tools specifically for handling images, video, audio or file assets in Svelte. Examples: media players, image galleries, file uploaders, lazy-loading media components. Key indicator: primarily works with media files or streams. NOT general UI components or data fetching utilities unless media-specific.'
	},
	server: {
		prompt:
			'Tools for server-side operations and client-server communication in Svelte. Examples: SSR utilities, API clients, data fetching libraries, server action wrappers. Key indicator: facilitates interaction between frontend and backend. NOT client-side state management or deployment tools (adapter tag).'
	},
	adapter: {
		prompt:
			'SvelteKit-specific deployment adapters or hosting integration tools. Examples: platform adapters (Vercel, Netlify, etc.), serverless deployment helpers, hosting configuration utilities. Key indicator: primary purpose is facilitating deployment to specific environments. NOT general server utilities or build tools.'
	},
	tooling: {
		prompt:
			'Development tools for Svelte that operate outside runtime code. Examples: build plugins, code generators, debugging utilities, CLI tools, linters. Key indicator: used during development process but not part of runtime application code. NOT runtime libraries, components, or server integrations.'
	},
	seo: {
		prompt:
			'Tools for improving search engine optimization in Svelte applications. Examples: meta tag managers, structured data generators, sitemap creators, link analyzers. Key indicator: primarily concerned with search engine visibility. NOT general head management or routing unless specifically SEO-focused.'
	},
	auth: {
		prompt:
			'User authentication and authorization solutions for Svelte. Examples: login systems, OAuth implementations, JWT handlers, permission managers. Key indicator: primarily concerned with user identity and access control. NOT general API clients or state management unless specifically auth-focused.'
	},
	integration: {
		prompt:
			'Connectors between Svelte and external services or systems. Examples: database clients, third-party API wrappers, payment processor integrations. Key indicator: primary purpose is connecting Svelte apps with external platforms. NOT general UI components or utilities unless they specifically bridge to external services.'
	},
	testing: {
		prompt:
			"Specialized testing tools designed for Svelte applications. Examples: component testing libraries, Svelte-aware test runners, store mocking utilities. Key indicator: explicitly built for testing Svelte code with awareness of Svelte's features. NOT general JavaScript testing tools that aren't Svelte-specific."
	},
	miscellaneous: {
		prompt:
			"Svelte utilities, helpers, and tools that don't fit cleanly into other categories. Examples: state management solutions, custom stores, actions, directives, form validation, performance optimizers, DOM manipulation utilities, scroll utilities, focus managers. Key indicator: provides functionality that enhances Svelte development but doesn't align with existing categories."
	}
} satisfies Record<string, { prompt: string }>;

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
		'vitest'
	],
	alias: {
		'@inlang/paraglide-js': 'paraglidejs',
		'drizzle-orm': 'drizzle'
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
			'vite-plugin-svelte',
			'rollup-plugin-svelte',
			'svelte-loader',
			'esbuild-svelte',
			'@sveltejs/vite-plugin-svelte'
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
		packages: [
			'svelte-meta-tags',
			'@sveltejs/amp',
			'svelte-seo',
			'super-sitemap',
			'svead',
			'@pouchlab/svead'
		]
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

const OVERRIDES = new Map<string | RegExp, boolean | number | Partial<Package>>([
	['vaul-svelte', true],
	['@formkit/auto-animate', -10],
	['lucide-svelte', -5],
	['sveltekit-flash-message', true],
	['sveltekit-rate-limiter', true],
	['@astrojs/starlight', true],
	['playwright', true],
	['vitest', true],
	['@inlang/paraglide-js', true],
	['phosphor-svelte', true],
	['@iconify/tailwind4', true],
	['@unocss/preset-icons', true],
	['drizzle-orm', true],
	['prettier', true],
	['storybook', true],
	['tailwindcss', true]
	// [/@smui\//, true] TODO: This kind of pattern complicates things, not supported yet. Instead focusing on getting smui to add svelte to their deps/peerDeps
]);

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
	TAGS,
	OVERRIDES,
	is_official,
	FEATURED,
	SV_ADD
};
