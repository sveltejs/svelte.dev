const modules: Record<string, string[]> = {
	svelte: [
		'svelte',
		'svelte/action',
		'svelte/animate',
		'svelte/attachments',
		'svelte/compiler',
		'svelte/easing',
		'svelte/events',
		'svelte/legacy',
		'svelte/motion',
		'svelte/reactivity',
		'svelte/reactivity/window',
		'svelte/server',
		'svelte/store',
		'svelte/transition'
	],
	kit: [
		'@sveltejs/kit',
		'@sveltejs/kit/env',
		'@sveltejs/kit/hooks',
		'@sveltejs/kit/node',
		'@sveltejs/kit/node/polyfills',
		'@sveltejs/kit/vite',
		'$app/env',
		'$app/env/private',
		'$app/env/public',
		'$app/environment',
		'$app/forms',
		'$app/navigation',
		'$app/paths',
		'$app/server',
		'$app/state',
		'$app/stores',
		'$app/types',
		'$env/dynamic/private',
		'$env/dynamic/public',
		'$env/static/private',
		'$env/static/public',
		'$service-worker'
	]
};

export function get_reference_module(filename: string) {
	const match = /(?:^|\/)docs\/(svelte|kit)\/\d+-reference\/\d+-(.+)\.md$/.exec(filename);
	if (!match) return;

	const [, topic, page] = match;
	return modules[topic].find((module) => module.replaceAll('/', '-') === page);
}

export function generated_type_references(): Record<string, string> {
	return Object.fromEntries(
		[
			'Action',
			'ActionData',
			'Actions',
			'EntryGenerator',
			'LayoutData',
			'LayoutLoad',
			'LayoutLoadEvent',
			'LayoutParams',
			'LayoutProps',
			'LayoutServerData',
			'LayoutServerLoad',
			'LayoutServerLoadEvent',
			'PageData',
			'PageLoad',
			'PageLoadEvent',
			'PageProps',
			'PageServerData',
			'PageServerLoad',
			'PageServerLoadEvent',
			'RequestEvent',
			'RequestHandler',
			'RouteId',
			'RouteParams'
		].map((name) => [name, '/docs/kit/types#Generated-types'])
	);
}
