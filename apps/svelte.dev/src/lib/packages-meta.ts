import type { PackageDefinition, PackageKey, PackageManual, PackageNpm } from './server/content';

const FEATURED: {
	title: string;
	description?: string;
	packages: PackageDefinition[];
}[] = [
	{
		title: 'Svelte CLI add-ons',
		description:
			'The <a href="/docs/cli">Svelte CLI</a> lets you instantly add functionality to a new or existing project with <code>npx sv add</code>',
		packages: [
			{ name: 'tailwindcss', svAlias: 'tailwind', description: 'A utility-first CSS framework' },
			{
				name: 'drizzle-orm',
				svAlias: 'drizzle',
				description:
					'Serverless-ready TypeScript ORM offering both relational and SQL-like query APIs'
			},
			{
				name: 'mdsvex',
				svAlias: 'mdsvex',
				description:
					'A Markdown preprocessor that lets you put Markdown in your Svelte and Svelte in your Markdown'
			},
			{ name: 'lucia', svAlias: 'lucia', description: 'Session-based password auth using Drizzle' },
			{
				name: 'storybook',
				svAlias: 'storybook',
				description: 'Develop, document, and test UI components in isolation'
			},
			{ name: 'prettier', svAlias: 'prettier', description: 'An opinionated code formatter' },
			{ name: 'eslint', svAlias: 'eslint', description: 'Find and fix problems in your code' },
			{ name: 'vitest', svAlias: 'vitest', description: 'Vite-powered testing framework' },
			{
				name: 'playwright',
				svAlias: 'playwright',
				description: 'Browser automation for end-to-end testing'
			},
			{
				name: '@inlang/paraglide-js',
				svAlias: 'paraglide',
				description: 'A compiler-based i18n library that emits tree-shakeable message functions'
			},
			{
				name: 'vite-plugin-devtools-json',
				svAlias: 'devtools-json',
				description: 'Generates Chromium DevTools project settings during development'
			}
		]
	},
	{
		title: 'Component libraries',
		packages: [
			{
				name: 'shadcn-svelte',
				description: 'A port of shadcn/ui, built with Bits UI and Tailwind CSS'
			},
			{
				name: 'bits-ui',
				description: 'Headless component primitives — bring your own styles'
			},
			{
				name: '@skeletonlabs/skeleton',
				description: 'An adaptive design system powered by Tailwind CSS'
			},
			{
				name: 'flowbite-svelte',
				description: 'Official Svelte port of Flowbite, a UI library powered by Tailwind CSS'
			},
			{ name: '@ark-ui/svelte', description: 'Headless component library built on top of Zag.js' },
			{
				name: 'daisyui',
				description: 'A set of classnames encapsulating Tailwind CSS styles'
			},
			{ name: 'svelte-material-ui', description: 'An implementation of Google’s Material UI' },
			{ name: 'carbon-components-svelte' },
			{
				name: 'melt',
				description: 'A low-level headless UI library'
			},
			{ name: '@sveltestrap/sveltestrap' }
		]
	},
	{
		title: 'SvelteKit adapters',
		packages: [
			{ name: '@sveltejs/adapter-node', description: 'Builds a standalone Node server' },
			{ name: '@sveltejs/adapter-cloudflare', description: 'Builds your app for Cloudflare' },
			{ name: '@sveltejs/adapter-netlify', description: 'Builds your app for Netlify' },
			{ name: '@sveltejs/adapter-vercel', description: 'Builds your app for Vercel' },
			{ name: '@sveltejs/adapter-static', description: 'Builds your static site' },
			{ name: '@deno/svelte-adapter', description: 'Builds your app for Deno Deploy' },
			{ name: 'amplify-adapter', description: 'Builds your app for AWS Amplify' },
			{ name: 'svelte-kit-sst', description: 'Builds your app for AWS Lambda and AWS Lamda@Edge' },
			{ name: 'svelte-adapter-bun', description: 'Builds your app for Bun' },
			{
				name: 'svelte-adapter-appengine',
				description: 'Builds your app for Google Cloud App Engine'
			},
			{
				name: 'sveltekit-adapter-chrome-extension',
				description: 'Builds your app as a Chrome extension using manifest v3'
			},
			{
				name: '@slicemachine/adapter-sveltekit',
				description: "Integrate with Prismic's Slice Machine"
			}
		]
	},
	{
		title: 'Content',
		packages: [
			{
				name: 'mdsvex',
				description: 'Put Markdown in your Svelte and Svelte in your Markdown'
			},
			{
				name: '@content-collections/core',
				description: 'Transform your content into type-safe data collections'
			},
			{ name: 'svelte-exmarkdown', description: 'Extensible component for Markdown rendering' },
			{
				name: '@magidoc/plugin-svelte-marked',
				description: 'Markdown parser that supports Github Flavored Markdown'
			},
			{
				name: '@prismicio/svelte',
				description: 'Components and helpers to fetch and present Prismic content'
			},
			{ name: 'carta-md' },
			{ name: '@sveltepress/vite', description: 'A content centered site build tool' },
			{
				name: '@evidence-dev/evidence',
				description:
					'A framework for building and publishing data products using SQL, Markdown, and AI'
			},
			{ name: 'svelte-pdf', description: 'Render PDF documents using PDF.js' },
			{ name: 'typewriter-editor' }
		]
	},
	{
		title: 'Data visualization',
		packages: [
			{
				name: 'layerchart',
				description: 'Composable chart components for building a wide range of visualizations'
			},
			{
				name: 'layercake',
				description: 'Create responsive graphics that can work without JavaScript'
			},
			{
				name: 'svelte-maplibre',
				description: 'Publish maps on your website with GPU-accelerated vector tile rendering'
			},
			{
				name: '@xyflow/svelte',
				description: 'Customizable component for building node-based UIs and diagrams'
			},
			{
				name: 'svelte-maplibre-gl',
				description: 'Build interactive web maps with MapLibre GL'
			}
		]
	},
	{
		title: 'Auth',
		packages: [
			{ name: 'better-auth', description: 'Comprehensive authentication library' },
			{
				name: '@supabase/ssr',
				description: 'Server-side library for cookie-based authentication with SvelteKit'
			},
			{
				name: 'altcha',
				description:
					'Privacy-first CAPTCHA widget, compliant with global regulations and WCAG accessible'
			},
			{
				name: 'svelte-clerk',
				description: 'Unofficial implementation of Clerk'
			},
			{ name: 'svelte-session-manager', description: 'JWT session store' },
			{
				name: 'svelte-kit-sessions',
				description: 'Session management library for SvelteKit'
			},
			{ name: '@passlock/sveltekit' }
		]
	},
	{
		title: 'Third party services',
		packages: [
			{ name: '@sentry/svelte' },
			{ name: '@sentry/sveltekit' },
			{ name: 'svelte-stripe', description: 'Add Stripe Elements to your project' },
			{
				name: 'svelte-clerk',
				description: 'Unofficial implementation of Clerk'
			},
			{
				name: '@storyblok/svelte',
				description: 'Integrate the Storyblok headless CMS into your project'
			},
			{
				name: '@inlang/paraglide-js',
				description: 'A compiler-based i18n library that emits tree-shakable message functions'
			}
		]
	},
	{
		title: 'Internationalization (i18n)',
		packages: [
			{
				name: '@inlang/paraglide-js',
				description: 'A compiler-based i18n library that emits tree-shakable message functions'
			},
			{ name: '@wuchale/svelte', description: 'Protobuf-like i18n from plain code' },
			{ name: 'i18n-js' }
		]
	},
	{
		title: 'Media',
		packages: [
			{ name: '@sveltejs/enhanced-img' },
			{
				name: '@unpic/svelte',
				description: 'Responsive image component that integrates with popular CDNs'
			},
			{ name: '@poppanator/sveltekit-svg' },
			{ name: 'svelte-easy-crop', description: 'A component for cropping images' },
			{
				name: '@uppy/svelte',
				description: 'Upload files from your computer or cloud storage services'
			},
			{ name: 'scrolly-video' }
		]
	},
	{
		title: 'Individual components',
		packages: [
			{
				name: '@tanstack/svelte-table',
				description: 'Headless UI for building powerful tables & datagrids'
			},
			{
				name: '@ai-sdk/svelte',
				description: 'Library for building AI-powered applications and agents'
			},
			{
				name: '@tanstack/svelte-virtual',
				description: 'Headless UI for virtualizing scrollable elements'
			},
			{
				name: 'virtua',
				description: 'A zero-config, fast and small (~3kB) virtual list and grid component'
			},
			{ name: '@event-calendar/core' }
		]
	},
	{
		title: 'Animations',
		packages: [
			{ name: '@threlte/core' },
			{ name: '@neoconfetti/svelte', description: 'Confetti explosion' },
			{ name: 'svelte-motion', description: 'Animation library based on framer-motion' },
			{ name: '@lottiefiles/svelte-lottie-player', description: 'Lottie animation player' },
			{
				name: '@tsparticles/svelte',
				description: 'Easily create highly customizable particles, confetti, and fireworks'
			}
		]
	},
	{
		title: 'SEO',
		packages: [
			{
				name: 'svelte-meta-tags',
				description: 'SEO components with deep merge functionality and JSON-LD support'
			},
			{
				name: 'super-sitemap',
				description:
					'A SvelteKit sitemap generator that makes it impossible to forget to add your paths'
			},
			{ name: 'svelte-seo', description: 'Add meta tags, Open Graph, and JSON-LD to your site' },
			{
				name: 'svead',
				description:
					'Set head meta information, canonical, title, Twitter and Facebook Open Graph tags, and schema.org data'
			}
		]
	},
	{
		title: 'Devtools',
		packages: [
			{ name: 'svelte-render-scan', description: 'Visual debugging tool' },
			{ name: 'svelte-inspect-value', description: 'Value inspector component' }
		]
	},
	{
		title: 'Icons',
		description:
			'See the <a href="/docs/kit/icons">icons documentation</a> for best practices when using an icon library',
		packages: [
			{ name: '@iconify/tailwind4' },
			{ name: '@unocss/preset-icons' },
			{ name: '@lucide/svelte', description: 'Beautiful and consistent icons' },
			{ name: 'svelte-awesome', description: 'Font Awesome icons for Svelte' },
			{ name: 'phosphor-svelte', description: 'A clean and friendly icon family' },
			{ name: 'unplugin-icons', description: 'A Vite plugin that provides icons on demand' }
		]
	},
	{
		title: 'Testing',
		description:
			'You might find the <a href="/docs/svelte/testing">documentation about testing</a> to be helpful during setup',
		packages: [
			{ name: '@testing-library/svelte', description: 'Testing utilities for DOM interaction' },
			{ name: 'playwright', description: 'Browser automation for end-to-end testing' },
			{ name: 'vitest' },
			{ name: 'storybook' }
		]
	},
	{
		title: 'Bundler plugins',
		description:
			'If you’re using SvelteKit or a similar framework, this part is taken care of. If you’re <a href="/docs/svelte/getting-started#Alternatives-to-SvelteKit">setting things up on your own</a>, you will need a plugin to tell your bundler how to compile Svelte files',
		packages: [
			{ name: '@sveltejs/vite-plugin-svelte' },
			{ name: 'rollup-plugin-svelte' },
			{ name: 'svelte-loader', description: 'Compile Svelte components with webpack' },
			{ name: 'esbuild-svelte', description: 'Compile Svelte components with esbuild' }
		]
	},
	{
		title: 'Routing',
		description:
			'The official router is <a href="/docs/kit">SvelteKit</a>, but here are some alternatives',
		packages: [
			{ name: 'svelte5-router' },
			{ name: '@roxi/routify', description: 'Routes based on file structure' },
			{ name: 'svelte-pathfinder', description: 'A tiny, state-based router' },
			{ name: 'universal-router' }
		]
	},
	{
		title: 'Data fetching',
		description:
			'We recommend using SvelteKit’s <a href="/docs/kit/remote-functions">remote functions</a>, but for specific needs you can use these alternatives',
		packages: [
			{
				name: '@tanstack/svelte-query',
				description: 'Primitives for managing, caching and syncing asynchronous and remote data'
			},
			{ name: '@urql/svelte', description: 'Customizable GraphQL client' },
			{ name: 'houdini', description: 'The disappearing GraphQL framework' },
			{
				name: 'trpc-sveltekit',
				description: 'SvelteKit adapter for tRPC.io that supports Node, Vercel and Netlify'
			},
			{
				name: '@orpc/svelte-query',
				description: 'APIs that are end-to-end type-safe and adhere to OpenAPI standards'
			},
			{ name: 'sswr' }
		]
	},
	{
		title: 'Forms',
		description:
			'SvelteKit has built-in <a href="/docs/kit/remote-functions#form">forms</a>, but you can also use these packages',
		packages: [
			{
				name: 'sveltekit-superforms',
				description: 'Server-side and client-side form validation library'
			},
			{
				name: 'formsnap',
				description: 'Accessible form components built on top of sveltekit-superforms'
			},
			{ name: 'felte', description: 'An extensible form library' },
			{ name: '@tanstack/svelte-form', description: 'Powerful, type-safe forms' }
		]
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

function is_outdated(iso: string): boolean {
	// 2 years
	return +new Date() - +new Date(iso) > 2 * 365 * 24 * 60 * 60 * 1000;
}

/**
 * Checks if a semver range supports Svelte versions 3.x, 4.x, and 5.x
 */
function supports_svelte_versions(version_range: string): {
	3: boolean;
	4: boolean;
	5: boolean;
} {
	if (!version_range) return { 3: false, 4: false, 5: false };

	// Initialize result object
	const result = { 3: false, 4: false, 5: false };

	// Handle version range with OR operators first before any other processing
	if (version_range.includes('||')) {
		const ranges = version_range.split('||').map((r) => r.trim());

		// Check each range and combine results with OR logic
		for (const range of ranges) {
			const range_result = supports_svelte_versions(range);
			result[3] = result[3] || range_result[3];
			result[4] = result[4] || range_result[4];
			result[5] = result[5] || range_result[5];
		}

		return result;
	}

	// Handle exact version with equals sign
	if (version_range.startsWith('=')) {
		const exact_version = version_range.substring(1);
		return supports_svelte_versions(exact_version);
	}

	// Handle hyphen ranges directly (not part of a complex expression)
	if (version_range.includes(' - ')) {
		// Split by hyphen and trim whitespace
		const parts = version_range.split('-').map((p) => p.trim());
		// Handle "x - y" format correctly
		if (parts.length === 2) {
			const start = parseFloat(parts[0]);
			const end = parseFloat(parts[1]);

			result[3] = start <= 3 && end >= 3;
			result[4] = start <= 4 && end >= 4;
			result[5] = start <= 5 && end >= 5;

			return result;
		}
	}

	// Handle complex version ranges with both upper and lower bounds in the same expression
	// Examples: ">=1.0.0 <=4.9.9", ">=3.0.0 <6.0.0", ">3.0.0-rc.1 <3.1.0"
	if (
		version_range.includes(' ') &&
		(version_range.includes('<') ||
			version_range.includes('<=') ||
			version_range.includes('>=') ||
			version_range.includes('>'))
	) {
		// Process for complex range with multiple constraints
		let includes_version_3 = true;
		let includes_version_4 = true;
		let includes_version_5 = true;

		// Split by spaces to get individual constraints
		const constraints = version_range
			.split(' ')
			.filter(
				(c) => c.startsWith('<') || c.startsWith('<=') || c.startsWith('>') || c.startsWith('>=')
			);

		// If we couldn't parse any valid constraints, return false
		if (constraints.length === 0) {
			return { 3: false, 4: false, 5: false };
		}

		// Special case handling for pre-release specific ranges (e.g., ">3.0.0-rc.1 <3.1.0")
		if (constraints.some((c) => c.includes('-'))) {
			// Identify if this is a narrow range for a specific major version
			let major_version = null;

			for (const constraint of constraints) {
				const match = constraint.match(/[<>=]+\s*(\d+)/);
				if (match) {
					const version = parseInt(match[1]);
					if (major_version === null) {
						major_version = version;
					} else if (major_version !== version) {
						major_version = null; // Different major versions, not a narrow range
						break;
					}
				}
			}

			// If we identified a specific major version for this pre-release constraint
			if (major_version !== null) {
				result[3] = major_version === 3;
				result[4] = major_version === 4;
				result[5] = major_version === 5;
				return result;
			}
		}

		for (const constraint of constraints) {
			if (constraint.startsWith('>=')) {
				const version_number = parseFloat(constraint.substring(2));
				// Check lower bounds for each version
				if (version_number > 3) includes_version_3 = false;
				if (version_number > 4) includes_version_4 = false;
				if (version_number > 5) includes_version_5 = false;
			} else if (constraint.startsWith('>')) {
				const version_number = parseFloat(constraint.substring(1));
				// Check lower bounds for each version
				if (version_number >= 3) includes_version_3 = false;
				if (version_number >= 4) includes_version_4 = false;
				if (version_number >= 5) includes_version_5 = false;
			} else if (constraint.startsWith('<=')) {
				const version_number = parseFloat(constraint.substring(2));
				// Check upper bounds for each version
				if (version_number < 3) includes_version_3 = false;
				if (version_number < 4) includes_version_4 = false;
				if (version_number < 5) includes_version_5 = false;
			} else if (constraint.startsWith('<')) {
				const version_number = parseFloat(constraint.substring(1));
				// Check upper bounds for each version
				if (version_number <= 3) includes_version_3 = false;
				if (version_number <= 4) includes_version_4 = false;
				if (version_number <= 5) includes_version_5 = false;
			}
		}

		result[3] = includes_version_3;
		result[4] = includes_version_4;
		result[5] = includes_version_5;

		return result;
	}

	// Handle exact major version format
	if (/^[0-9]+$/.test(version_range)) {
		const version = parseInt(version_range);
		result[3] = version === 3;
		result[4] = version === 4;
		result[5] = version === 5;
		return result;
	}

	// Handle caret ranges
	if (version_range.startsWith('^')) {
		const major_version = parseInt(version_range.substring(1).split('.')[0]);
		result[3] = major_version === 3;
		result[4] = major_version === 4;
		result[5] = major_version === 5;
		return result;
	}

	// Handle pre-release versions directly (e.g., 5.0.0-next.42)
	if (/^([0-9]+)\.([0-9]+)\.([0-9]+)-/.test(version_range)) {
		const match = version_range.match(/^([0-9]+)\./);
		if (match) {
			// Extract major version from the pre-release
			const major_version = parseInt(match[1]);
			result[3] = major_version === 3;
			result[4] = major_version === 4;
			result[5] = major_version === 5;
			return result;
		}
	}

	// Handle tilde ranges
	if (version_range.startsWith('~')) {
		const major_version = parseInt(version_range.substring(1).split('.')[0]);
		result[3] = major_version === 3;
		result[4] = major_version === 4;
		result[5] = major_version === 5;
		return result;
	}

	// Handle wildcard (*) by itself, which means any version
	if (version_range === '*') {
		return { 3: true, 4: true, 5: true };
	}

	// Handle * and x ranges (e.g., "3.x", "4.*")
	if (/^([0-9]+)\.(x|\*)/.test(version_range)) {
		const match = version_range.match(/^([0-9]+)\./);
		if (match) {
			const major_version = parseInt(match[1]);
			result[3] = major_version === 3;
			result[4] = major_version === 4;
			result[5] = major_version === 5;
			return result;
		}
	}

	// Handle >= ranges
	if (version_range.startsWith('>=')) {
		const version_number = parseFloat(version_range.substring(2));
		result[3] = version_number <= 3;
		result[4] = version_number <= 4;
		result[5] = version_number <= 5;
		return result;
	}

	// Handle > ranges
	if (version_range.startsWith('>')) {
		const version_number = parseFloat(version_range.substring(1));
		result[3] = version_number < 3;
		result[4] = version_number < 4;
		result[5] = version_number < 5;
		return result;
	}

	// Handle <= ranges
	if (version_range.startsWith('<=')) {
		const version_number = parseFloat(version_range.substring(2));
		result[3] = version_number >= 3;
		result[4] = version_number >= 4;
		result[5] = version_number >= 5;
		return result;
	}

	// Handle < ranges
	if (version_range.startsWith('<')) {
		const version_number = parseFloat(version_range.substring(1));
		result[3] = version_number > 3;
		result[4] = version_number > 4;
		result[5] = version_number > 5;
		return result;
	}

	// Handle exact versions (like 3.0.0, 4.1.2, etc.)
	if (/^[0-9]+\.[0-9]+\.[0-9]+$/.test(version_range)) {
		const major_version = parseInt(version_range.split('.')[0]);
		result[3] = major_version === 3;
		result[4] = major_version === 4;
		result[5] = major_version === 5;
		return result;
	}

	// Handle x-ranges (3.x.x, 4.x, etc.)
	if (version_range.includes('.x') || version_range.includes('.*')) {
		const major_version = parseInt(version_range.split('.')[0]);
		result[3] = major_version === 3;
		result[4] = major_version === 4;
		result[5] = major_version === 5;
		return result;
	}

	return result;
}

function remove_ending_by(str: string, endings: string[]): string {
	for (const ending of endings) {
		if (str.endsWith(ending)) {
			return str.slice(0, -ending.length);
		}
	}
	return str;
}

function calculate_description(pkg: PackageKey & PackageNpm): string {
	const found = FEATURED.flatMap((f) => f.packages).find((p) => p.name === pkg.name);
	if (found && found.description) return remove_ending_by(found.description, ['.']);

	let desc = pkg.npm_description ?? 'NO DESCRIPTION!';
	const replaces = [
		// strip out markdown links
		{ key: /\[(.*?)\]\((.*?)\)/g, value: '$1' }
	];
	for (const { key, value } of replaces) {
		desc = desc.replace(key, value);
	}
	return remove_ending_by(desc, ['.']);
}

function calculate_homepage(pkg: PackageKey & PackageNpm): string {
	return remove_ending_by(pkg.homepage ?? '', ['#readme']);
}

export const PACKAGES_META = {
	FEATURED,

	calculate_description,
	calculate_homepage,

	is_official,
	is_outdated,
	supports_svelte_versions
};
