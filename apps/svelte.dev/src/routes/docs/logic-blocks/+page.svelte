<script>
	import RemovedPage from '../RemovedPage.svelte';

	const docs = new Map([
		['if', ['`{#if ...}`', '/docs/svelte/if']],
		['each', ['`{#each ...}`', '/docs/svelte/each']],
		['await', ['`{#await ...}`', '/docs/svelte/await']],
		['key', ['`{#key ...}`', '/docs/svelte/key']]
	]);
</script>

<RemovedPage {docs} />
