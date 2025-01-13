<script>
	import RemovedPage from '../../RemovedPage.svelte';

	const docs = new Map([
		[
			'$app-environment-browser',
			['`$app/environment#browser`', '/docs/kit/$app-environment#browser']
		],
		[
			'$app-environment-building',
			['`$app/environment#building`', '/docs/kit/$app-environment#building']
		],
		['$app-environment-dev', ['`$app/environment#dev`', '/docs/kit/$app-environment#dev']],
		[
			'$app-environment-version',
			['`$app/environment#version`', '/docs/kit/$app-environment#version']
		],
		['$app-forms-applyaction', ['`$app/forms#applyAction`', '/docs/kit/$app-forms#applyAction']],
		['$app-forms-deserialize', ['`$app/forms#deserialize`', '/docs/kit/$app-forms#deserialize']],
		['$app-forms-enhance', ['`$app/forms#enhance`', '/docs/kit/$app-forms#enhance']],
		[
			'$app-navigation-afternavigate',
			['`$app/navigation#afternavigate`', '/docs/kit/$app-navigation#afterNavigate']
		],
		[
			'$app-navigation-beforenavigate',
			['`$app/navigation#beforeNavigate`', '/docs/kit/$app-navigation#beforeNavigate']
		],
		[
			'$app-navigation-disablescrollhandling',
			['`$app/navigation#disableScrollHandling`', '/docs/kit/$app-navigation#disableScrollHandling']
		],
		['$app-navigation-goto', ['`$app/navigation#goto`', '/docs/kit/$app-navigation#goto']],
		[
			'$app-navigation-invalidate',
			['`$app/navigation#invalidate`', '/docs/kit/$app-navigation#invalidate']
		],
		[
			'$app-navigation-invalidateall',
			['`$app/navigation#invalidateAll`', '/docs/kit/$app-navigation#invalidateAll']
		],
		[
			'$app-navigation-onnavigate',
			['`$app/navigation#onNavigate`', '/docs/kit/$app-navigation#onNavigate']
		],
		[
			'$app-navigation-preloadcode',
			['`$app/navigation#preloadCode`', '/docs/kit/$app-navigation#preloadCode']
		],
		[
			'$app-navigation-preloaddata',
			['`$app/navigation#preloadData`', '/docs/kit/$app-navigation#preloadData']
		],
		[
			'$app-navigation-pushstate',
			['`$app/navigation#pushState`', '/docs/kit/$app-navigation#pushState']
		],
		[
			'$app-navigation-replacestate',
			['`$app/navigation#replaceState`', '/docs/kit/$app-navigation#replaceState']
		],
		['$app-paths-assets', ['`$app/paths#assets`', '/docs/kit/$app-paths#assets']],
		['$app-paths-base', ['`$app/paths#base`', '/docs/kit/$app-paths#base']],
		['$app-paths-resolveroute', ['`$app-paths#resolveRoute`', '/docs/kit/$app-paths#resolveRoute']],
		['$app-server-read', ['`$app/server#read`', '/docs/kit/$app-server#read']],
		['$app-stores-getstores', ['`$app/stores#getStores`', '/docs/kit/$app-stores#getStores']],
		['$app-stores-navigating', ['`$app/stores#navigating`', '/docs/kit/$app-stores#navigating']],
		['$app-stores-page', ['`$app/stores#page`', '/docs/kit/$app-stores#page']],
		['$app-stores-updated', ['`$app/stores#updated`', '/docs/kit/$app-stores#updated']],
		['$lib-$lib-server', ['`$lib`', '/docs/kit/$lib']],
		['$service-worker-base', ['`$service-worker#base`', '/docs/kit/$service-worker#base']],
		['$service-worker-build', ['`$service-worker#build`', '/docs/kit/$service-worker#build']],
		['$service-worker-files', ['`$service-worker#files`', '/docs/kit/$service-worker#files']],
		[
			'$service-worker-prerendered',
			['`$service-worker#prerendered`', '/docs/kit/$service-worker#prerendered']
		],
		['$service-worker-version', ['`$service-worker#version`', '/docs/kit/$service-worker#version']],
		['sveltejs-kit-version', ['`@sveltejs/kit#VERSION`', '/docs/kit/@sveltejs-kit#VERSION']],
		['sveltejs-kit-error', ['`@sveltejs/kit#error`', '/docs/kit/@sveltejs-kit#error']],
		['sveltejs-kit-fail', ['`@sveltejs/kit#fail`', '/docs/kit/@sveltejs-kit#fail']],
		[
			'sveltejs-kit-ishttperror',
			['`@sveltejs/kit#isHttpError`', '/docs/kit/@sveltejs-kit#isHttpError']
		],
		[
			'sveltejs-kit-isredirect',
			['`@sveltejs/kit#isRedirect`', '/docs/kit/@sveltejs-kit#isRedirect']
		],
		['sveltejs-kit-json', ['`@sveltejs/kit#json`', '/docs/kit/@sveltejs-kit#json']],
		['sveltejs-kit-redirect', ['`@sveltejs/kit#redirect`', '/docs/kit/@sveltejs-kit#redirect']],
		['sveltejs-kit-text', ['`@sveltejs/kit#text`', '/docs/kit/@sveltejs-kit#text']],
		[
			'sveltejs-kit-hooks-sequence',
			['`@sveltejs/kit/hooks#sequence`', '/docs/kit/@sveltejs-kit-hooks#sequence']
		],
		[
			'sveltejs-kit-node-createreadablestream',
			[
				'`@sveltejs/kit/node#createReadableStream`',
				'/docs/kit/@sveltejs-kit-node#createReadableStream'
			]
		],
		[
			'sveltejs-kit-node-getrequest',
			['`@sveltejs/kit/node#getRequest`', '/docs/kit/@sveltejs-kit-node#getRequest']
		],
		[
			'sveltejs-kit-node-setresponse',
			['`@sveltejs/kit/node#setResponse`', '/docs/kit/@sveltejs-kit-node#setResponse']
		],
		[
			'sveltejs-kit-node-polyfills-installpolyfills',
			[
				'`@sveltejs/kit/node/polyfills#installPolyfills`',
				'/docs/kit/@sveltejs-kit-node-polyfills#installPolyfills'
			]
		],
		[
			'sveltejs-kit-vite-sveltekit',
			['`@sveltejs/kit/vite#sveltekit`', '/docs/kit/@sveltejs-kit-vite#sveltekit']
		]
	]);
</script>

<RemovedPage {docs} />
