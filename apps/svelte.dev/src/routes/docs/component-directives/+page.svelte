<script>
	import RemovedPage from '../RemovedPage.svelte';

	const docs = new Map([
		[
			'on-eventname ',
			['`on:eventname`', '/docs/svelte/v5-migration-guide#Event-changes-Component-events']
		],
		['style-props', ['`--style-props`', '/docs/svelte/custom-properties']],
		['bind-property ', ['`bind:property`', '/docs/svelte/bind#bind:property-for-components']],
		['bind-this ', ['`bind:this`', '/docs/svelte/bind#bind:this']]
	]);
</script>

<RemovedPage {docs} />
