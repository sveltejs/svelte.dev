import type { PackageDefinition, PackageKey, PackageManual, PackageNpm } from './server/content';

const FEATURED: {
	title: string;
	description?: string;
	packages: PackageDefinition[];
}[] = [
	{
		title: 'Svelte CLI add-ons',
		description:
			'<a href="/docs/cli">sv, the Svelte CLI</a>, lets you instantly add functionality to a new or existing project.',
		packages: [
			{ name: 'tailwindcss', svAlias: 'tailwind' },
			{ name: 'drizzle-orm', svAlias: 'drizzle' },
			{ name: 'mdsvex', svAlias: 'mdsvex' },
			{ name: 'lucia', svAlias: 'lucia', description: 'A guide to implementing auth in your app.' },
			{ name: 'storybook', svAlias: 'storybook' },
			{ name: 'prettier', svAlias: 'prettier' },
			{ name: 'eslint', svAlias: 'eslint' },
			{ name: 'vitest', svAlias: 'vitest' },
			{ name: 'playwright', svAlias: 'playwright' },
			{
				name: '@inlang/paraglide-js',
				svAlias: 'paraglide',
				description: 'A compiler-based i18n library that emits tree-shakable message functions.'
			},
			{ name: 'vite-plugin-devtools-json', svAlias: 'devtools-json' }
		]
	},
	{
		title: 'Component libraries',
		packages: [
			{ name: 'shadcn-svelte' },
			{ name: 'bits-ui', description: 'Headless components for Svelte.' },
			{ name: '@ark-ui/svelte' },
			{
				name: '@skeletonlabs/skeleton',
				description: 'Skeleton is an adaptive design system powered by Tailwind CSS.'
			},
			{
				name: 'flowbite-svelte',
				description: 'Official Svelte components built for Flowbite and Tailwind CSS'
			},
			{ name: 'daisyui' },
			{ name: 'svelte-material-ui' },
			{ name: 'carbon-components-svelte' },
			{ name: 'melt' },
			{ name: '@sveltestrap/sveltestrap' }
		]
	},
	{
		title: 'Individual components',
		packages: [
			{ name: '@tanstack/svelte-table' },
			{ name: '@ai-sdk/svelte', description: 'Svelte UI components for the AI SDK' },
			{ name: '@tanstack/svelte-virtual' },
			{ name: 'virtua' },
			{ name: '@event-calendar/core' }
		]
	},
	{
		title: 'SvelteKit adapters',
		packages: [
			{ name: '@sveltejs/adapter-auto' },
			{ name: '@sveltejs/adapter-node' },
			{ name: '@sveltejs/adapter-vercel' },
			{ name: '@sveltejs/adapter-cloudflare' },
			{ name: '@sveltejs/adapter-netlify' },
			{ name: '@deno/svelte-adapter' },
			{ name: 'amplify-adapter' },
			{ name: 'svelte-kit-sst' },
			{ name: 'svelte-adapter-bun' },
			{ name: 'svelte-adapter-appengine' },
			{ name: 'sveltekit-adapter-chrome-extension' },
			{ name: '@slicemachine/adapter-sveltekit' }
		]
	},
	{
		title: 'Icons',
		packages: [
			{ name: '@iconify/tailwind4' },
			{ name: '@unocss/preset-icons' },
			{ name: 'lucide-svelte' },
			{ name: 'svelte-awesome' },
			{ name: 'phosphor-svelte' }
		]
	},
	{
		title: 'Data visualization',
		packages: [
			{ name: 'layerchart' },
			{ name: 'layercake' },
			{ name: 'svelte-maplibre' },
			{ name: 'svelte-chartjs', description: 'Create charts using Chart.js in Svelte apps.' },
			{
				name: '@xyflow/svelte',
				description: 'Powerful libraries for building node-based UIs with Svelte.'
			},
			{ name: 'svelte-maplibre-gl' }
		]
	},
	{
		title: 'Animations',
		packages: [
			{ name: '@threlte/core' },
			{ name: '@neoconfetti/svelte' },
			{ name: 'svelte-motion' },
			{ name: '@lottiefiles/svelte-lottie-player' },
			{ name: '@tsparticles/svelte' }
		]
	},
	{
		title: 'Content',
		packages: [
			{ name: 'mdsvex' },
			{ name: '@content-collections/core' },
			{ name: 'svelte-exmarkdown' },
			{ name: '@magidoc/plugin-svelte-marked' },
			{ name: '@prismicio/svelte' },
			{ name: 'carta-md' },
			{ name: '@svelteness/kit-docs' },
			{ name: '@sveltepress/vite' },
			{ name: '@evidence-dev/evidence' },
			{ name: 'svelte-pdf' },
			{ name: 'typewriter-editor' },
			{ name: '@svelte-put/toc' }
		]
	},
	{
		title: 'Bundler plugins',
		packages: [
			{ name: '@sveltejs/vite-plugin-svelte' },
			{ name: 'rollup-plugin-svelte' },
			{ name: 'svelte-loader' },
			{ name: 'esbuild-svelte' }
		]
	},
	{
		title: 'Media',
		packages: [
			{ name: '@sveltejs/enhanced-img' },
			{ name: '@unpic/svelte' },
			{ name: '@poppanator/sveltekit-svg' },
			{ name: 'svelte-easy-crop' },
			{ name: '@uppy/svelte' },
			{ name: 'scrolly-video' }
		]
	},
	{
		title: 'SEO',
		packages: [
			{ name: 'svelte-meta-tags' },
			{ name: 'super-sitemap' },
			{ name: 'svelte-seo' },
			{ name: '@sveltejs/amp' },
			{ name: 'svead', description: 'Svelte component for managing meta tags and SEO.' }
		]
	},
	{
		title: 'Auth',
		packages: [
			{ name: 'better-auth' },
			{ name: '@auth/sveltekit' },
			{ name: '@supabase/ssr' },
			{ name: 'altcha' },
			{ name: 'svelte-clerk' },
			{ name: 'svelte-session-manager' },
			{ name: 'svelte-kit-sessions' },
			{ name: '@passlock/sveltekit' }
		]
	},
	{
		title: 'Internationalization (i18n)',
		packages: [
			{
				name: '@inlang/paraglide-js',
				description: 'A compiler-based i18n library that emits tree-shakable message functions.'
			},
			{ name: '@wuchale/svelte' },
			{ name: 'i18n-js' }
		]
	},
	{
		title: 'Third party services',
		packages: [
			{ name: '@sentry/svelte' },
			{ name: '@sentry/sveltekit' },
			{ name: 'svelte-stripe' },
			{ name: 'svelte-clerk' },
			{ name: '@storyblok/svelte' },
			{
				name: '@inlang/paraglide-js',
				description: 'A compiler-based i18n library that emits tree-shakable message functions.'
			}
		]
	},
	{
		title: 'Testing and devtools',
		packages: [
			{ name: '@testing-library/svelte' },
			{ name: 'playwright' },
			{ name: 'vitest' },
			{ name: 'svelte-render-scan' },
			{ name: 'svelte-inspect-value' }
		]
	},
	{
		title: 'Router',
		description:
			'<a href="/docs/kit">SvelteKit</a> is recommended, but here are some alternatives.',
		packages: [
			{ name: '@sveltejs/kit' },
			{ name: 'svelte-routing' },
			{ name: '@roxi/routify', description: 'Automate Svelte routes based on file structure.' },
			{ name: 'svelte5-router' },
			{ name: 'svelte-pathfinder' },
			{ name: 'universal-router' }
		]
	},
	{
		title: 'Data fetching',
		description:
			'<a href="/docs/kit/remote-functions">SvelteKit remote functions</a> are recommended, but here are some alternatives.',
		packages: [
			{ name: '@tanstack/svelte-query' },
			{ name: '@urql/svelte' },
			{ name: 'houdini' },
			{ name: 'trpc-sveltekit' },
			{ name: '@orpc/svelte-query', description: 'Fetch and manage data in Svelte with orpc.' },
			{ name: 'sswr' }
		]
	},
	{
		title: 'Forms',
		description:
			'<a href="/docs/kit/remote-functions#form">SvelteKit forms</a> are recommended, but here are some alternatives.',
		packages: [
			{ name: 'sveltekit-superforms' },
			{
				name: 'formsnap',
				description: 'Wraps sveltekit-superforms with accessible form components.'
			},
			{ name: 'felte' },
			{ name: '@tanstack/svelte-form' }
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

function calculate_description(pkg: PackageKey & PackageNpm): string {
	const found = FEATURED.flatMap((f) => f.packages).find((p) => p.name === pkg.name);
	if (found && found.description) return found.description;

	let desc = pkg.npm_description ?? 'NO DESCRIPTION!';
	const replaces = [
		// strip out markdown links
		{ key: /\[(.*?)\]\((.*?)\)/g, value: '$1' }
	];
	for (const { key, value } of replaces) {
		desc = desc.replace(key, value);
	}
	return desc;
}

export const PACKAGES_META = {
	FEATURED,

	is_official,
	is_outdated,
	supports_svelte_versions,
	calculate_description
};
