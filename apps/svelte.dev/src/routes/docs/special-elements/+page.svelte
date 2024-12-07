<script>
	import RemovedPage from '../RemovedPage.svelte';

	const docs = new Map([
		['slot ', ['`<slot>`', '/docs/svelte/legacy-slots']],
		['svelte-self', ['`<svelte:self>`', '/docs/svelte/legacy-svelte-self']],
		['svelte-component ', ['`<svelte:component>`', '/docs/svelte/legacy-svelte-component']],
		['svelte-element ', ['`<svelte:element>`', '/docs/svelte/svelte-element']],
		['svelte-window ', ['`<svelte:window>`', '/docs/svelte/svelte-window']],
		['svelte-document ', ['`<svelte:document>`', '/docs/svelte/svelte-document']],
		['svelte-body ', ['`<svelte:body>`', '/docs/svelte/svelte-body']],
		['svelte-head ', ['`<svelte:head>`', '/docs/svelte/svelte-head']],
		['svelte-options ', ['`<svelte:options>`', '/docs/svelte/svelte-options']],
		['svelte-fragment ', ['`<svelte:fragment>`', '/docs/svelte/legacy-svelte-fragment']]
	]);
</script>

<RemovedPage {docs} />
