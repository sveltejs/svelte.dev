import type { Package } from './server/content';

const TAGS = {
	'design-system': {
		prompt:
			'MUST contain 2+ reusable Svelte components designed as a cohesive set with shared design principles. Examples: complete UI kits, design systems, form libraries, widget collections, component libraries. Key indicator: components are intentionally built to work together, share styling patterns, and serve a unified purpose. NOT a single component or unrelated components bundled together.',
		title: 'Component Libraries',
		featured: [
			'bits-ui',
			'@melt-ui/svelte',
			'@skeletonlabs/skeleton',
			'flowbite-svelte',
			'konsta',
			'shadcn-svelte',
			'svelte-material-ui',
			'carbon-components-svelte',
			'@ikun-ui/core',
			'sveltestrap',
			'@svelteuidev/core',
			'@zag-js/svelte'
		]
	},
	ui: {
		prompt:
			'Individual visual Svelte components or styling tools focused on appearance. Examples: standalone UI elements (buttons, modals, dropdowns), animation libraries, transition effects, tooltips. Key indicator: primary purpose is enhancing visual presentation. NOT state management tools or multi-component systems that would qualify as design systems.',
		title: 'UI',
		featured: [
			'@xyflow/svelte',
			'@tanstack/svelte-table',
			'lucide-svelte',
			'@ai-sdk/svelte',
			'svelte-moveable',
			'@tanstack/svelte-virtual',
			'maska',
			'virtua',
			'@threlte/core',
			'@event-calendar/core',
			'svelte-chartjs'
		]
	},
	router: {
		prompt:
			'Manages navigation and URL handling in Svelte apps. Examples: client-side routers, path matching utilities, navigation guards, route parameter parsers. Key indicator: primary purpose is handling application navigation flow and URL state. NOT page transition animations (ui tag) or general application state management.',
		title: 'Routing & Navigation',
		featured: [
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
	content: {
		prompt:
			'Tools for creating, processing, and rendering structured content in Svelte. Examples: Markdown/MDX processors, CMS connectors, blog frameworks, documentation generators. Key indicator: focused on content authoring, organization, or display. NOT general data fetching (server tag) or UI components (ui tag) unless specifically content-oriented.',
		title: 'Content',
		featured: [
			'mdsvex',
			'svelte-markdown',
			'carta-md',
			'typewriter-editor',
			'@svelte-put/toc',
			'@prismicio/svelte',
			'@svelteness/kit-docs',
			'@evidence-dev/evidence',
			'@magidoc/plugin-svelte-marked',
			'svelte-exmarkdown',
			'svelte-slate'
		]
	},
	media: {
		prompt:
			'Tools specifically for handling images, video, audio or file assets in Svelte. Examples: media players, image galleries, file uploaders, lazy-loading media components. Key indicator: primarily works with media files or streams. NOT general UI components or data fetching utilities unless media-specific.',
		title: 'Media',
		featured: [
			'@sveltejs/enhanced-img',
			'@threlte/gltf',
			'@vime/svelte',
			'@uppy/svelte',
			'@unpic/svelte',
			'unlazy-svelte',
			'scrolly-video',
			'@zerodevx/svelte-img',
			'svimg',
			'svelte-easy-crop',
			'svelte-pdf',
			'@lottiefiles/svelte-lottie-player'
		]
	},
	server: {
		prompt:
			'Tools for server-side operations and client-server communication in Svelte. Examples: SSR utilities, API clients, data fetching libraries, server action wrappers. Key indicator: facilitates interaction between frontend and backend. NOT client-side state management or deployment tools (adapter tag).',
		title: 'Server',
		featured: [
			'@urql/svelte',
			'@sentry/sveltekit',
			'trpc-sveltekit',
			'sswr',
			'golte',
			'@tanstack/svelte-query',
			'@kitql/handles',
			'svelte-kit-sessions',
			'sveltekit-flash-message',
			'sveltekit-rate-limiter'
		]
	},
	adapter: {
		prompt:
			'SvelteKit-specific deployment adapters or hosting integration tools. Examples: platform adapters (Vercel, Netlify, etc.), serverless deployment helpers, hosting configuration utilities. Key indicator: primary purpose is facilitating deployment to specific environments. NOT general server utilities or build tools.',
		title: 'Svelte-Kit Adapters',
		featured: [
			'@sveltejs/adapter-node',
			'@sveltejs/adapter-static',
			'@sveltejs/adapter-vercel',
			'@sveltejs/adapter-cloudflare',
			'svelte-kit-sst',
			'svelte-adapter-bun',
			'@slicemachine/adapter-sveltekit',
			'amplify-adapter',
			'svelte-adapter-deno',
			'svelte-adapter-appengine',
			'svelte-adapter-ghpages'
		]
	},
	tooling: {
		prompt:
			'Development tools for Svelte that operate outside runtime code. Examples: build plugins, code generators, debugging utilities, CLI tools, linters. Key indicator: used during development process but not part of runtime application code. NOT runtime libraries, components, or server integrations.',
		title: 'Tooling',
		featured: [
			'svelte2tsx',
			'@sveltejs/package',
			'@tsconfig/svelte',
			'@sveltejs/vite-plugin-svelte',
			'prettier-plugin-svelte',
			'@storybook/svelte',
			'esbuild-svelte',
			'@sveltejs/vite-plugin-svelte-inspector',
			'@storybook/addon-svelte-csf',
			'sv',
			'@unocss/svelte-scoped'
		]
	},
	seo: {
		prompt:
			'Tools for improving search engine optimization in Svelte applications. Examples: meta tag managers, structured data generators, sitemap creators, link analyzers. Key indicator: primarily concerned with search engine visibility. NOT general head management or routing unless specifically SEO-focused.',
		title: 'SEO',
		featured: [
			'svelte-meta-tags',
			'@sveltejs/amp',
			'svelte-seo',
			'super-sitemap',
			'svead',
			'@pouchlab/svead',
			'runatics',
			'runes-meta-tags'
		]
	},
	auth: {
		prompt:
			'User authentication and authorization solutions for Svelte. Examples: login systems, OAuth implementations, JWT handlers, permission managers. Key indicator: primarily concerned with user identity and access control. NOT general API clients or state management unless specifically auth-focused.',
		title: 'Auth',
		featured: [
			'lucia',
			'@auth/sveltekit',
			'altcha',
			'svelte-session-manager',
			'clerk-sveltekit',
			'svelte-kit-sessions',
			'@supabase/auth-helpers-sveltekit',
			'@passlock/sveltekit',
			'svelte-wagmi',
			'svault',
			'sveltekit-turnstile'
		]
	},
	integration: {
		prompt:
			'Connectors between Svelte and external services or systems. Examples: database clients, third-party API wrappers, payment processor integrations. Key indicator: primary purpose is connecting Svelte apps with external platforms. NOT general UI components or utilities unless they specifically bridge to external services.',
		title: 'Integrations',
		featured: [
			'@astrojs/svelte',
			'typesafe-i18n',
			'houdini',
			'sveltekit-i18n',
			'@prosemirror-adapter/svelte',
			'@storyblok/svelte',
			'@nerdworks/svelte',
			'@telegram-apps/sdk-svelte',
			'@tolgee/svelte',
			'sailkit',
			'svelte-wagmi'
		]
	},
	testing: {
		prompt:
			"Specialized testing tools designed for Svelte applications. Examples: component testing libraries, Svelte-aware test runners, store mocking utilities. Key indicator: explicitly built for testing Svelte code with awareness of Svelte's features. NOT general JavaScript testing tools that aren't Svelte-specific.",
		title: 'Testing',
		featured: [
			'@testing-library/svelte',
			'@playwright/experimental-ct-svelte',
			'svelte-jester',
			'@cypress/svelte',
			'vitest-browser-svelte'
		]
	},
	miscellaneous: {
		prompt:
			"Svelte utilities, helpers, and tools that don't fit cleanly into other categories. Examples: state management solutions, custom stores, actions, directives, form validation, performance optimizers, DOM manipulation utilities, scroll utilities, focus managers. Key indicator: provides functionality that enhances Svelte development but doesn't align with existing categories.",
		title: 'State',
		featured: [
			'runed',
			'@state/svelte',
			'sveltekit-superforms',
			'@imask/svelte',
			'svelte-persisted-store',
			'felte',
			'svelvet',
			'@svelte-put/shortcut',
			'@threlte/rapier',
			'@svelte-put/copy',
			'svelte-keyed'
		]
	}
} satisfies Record<string, { prompt: string; title: string; featured?: string[] }>;

const OVERRIDES = {
	'vaul-svelte': true,
	'@formkit/auto-animate': -10,
	'lucide-svelte': -5,
	'sveltekit-flash-message': true,
	'sveltekit-rate-limiter': true
} satisfies Record<string, boolean | number | Partial<Package>>;

const OFFICIAL = [
	/^@sveltejs\//,
	'prettier-plugin-svelte',
	'svelte',
	'svelte2tsx',
	'eslint-plugin-svelte'
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
	is_official
};
