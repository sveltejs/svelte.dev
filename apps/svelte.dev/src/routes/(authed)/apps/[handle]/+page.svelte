<script lang="ts">
	import AppList from '../AppList.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.owner.display_name || data.owner.handle}'s apps • Svelte</title>
</svelte:head>

<AppList
	accounts={data.accounts}
	destination={data.destination}
	owner={data.owner}
	gists={data.gists}
	next={null}
	search={data.search}
	tab="atproto-public"
/>
