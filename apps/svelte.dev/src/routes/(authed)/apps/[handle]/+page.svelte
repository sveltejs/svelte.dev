<script lang="ts">
	import AppList from '../AppList.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.owner.display_name || data.owner.handle}'s apps • Svelte</title>
	<!-- someone else's records, rendered on our origin: not ours to index -->
	<meta name="robots" content="noindex" />
</svelte:head>

<AppList
	accounts={data.accounts}
	destination={data.destination}
	owner={data.owner}
	apps={data.apps}
	next={data.next}
	search={data.search}
	tab="atproto-public"
/>
