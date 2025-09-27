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

const FEATURED: { title: string; description?: string; packages: string[] }[] = [
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
			'sveltekit-adapter-chrome-extension',
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
			'@content-collections/core',
			'carta-md',
			'typewriter-editor',
			'@svelte-put/toc',
			'@prismicio/svelte',
			'@svelteness/kit-docs',
			'@sveltepress/vite',
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
			'@unpic/svelte',
			'@poppanator/sveltekit-svg',
			'@uppy/svelte',
			'scrolly-video',
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
			'svelte-clerk',
			'svelte-kit-sessions',
			'@supabase/ssr',
			'@passlock/sveltekit'
		]
	},
	{
		title: 'Internationalization (i18n)',
		packages: ['@inlang/paraglide-js', '@wuchale/svelte', 'i18n-js']
	},
	{
		title: 'Third party services',
		packages: [
			'@sentry/svelte',
			'@sentry/sveltekit',
			'svelte-stripe',
			'svelte-clerk',
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
			'svelte-inspect-value',
			'svelte-render-scan'
		]
	},
	{
		title: 'Router',
		description:
			'<a href="/docs/kit">SvelteKit</a> is recommended, but here are some alternatives.',
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
		description:
			'<a href="/docs/kit/remote-functions">SvelteKit remote functions</a> are recommended, but here are some alternatives.',
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
		description:
			'<a href="/docs/kit/remote-functions#form">SvelteKit forms</a> are recommended, but here are some alternatives.',
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

export const PACKAGES_META = {
	is_official,
	is_outdated,
	supports_svelte_versions,
	FEATURED,
	SV_ADD,
	SV_ADD_CMD
};
