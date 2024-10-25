<script>
	import RemovedPage from '../RemovedPage.svelte';

	const docs = new Map([
		['if', ['{#if ...}', '/docs/svelte/if']],
		['each', ['{#each ...}', '/docs/svelte/each']],
		['await', ['{#key ...}', '/docs/svelte/await']],
		['key', ['{#await ...}', '/docs/svelte/key']]
	]);
</script>

<RemovedPage {docs} />
