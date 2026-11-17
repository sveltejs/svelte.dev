<script lang="ts">
	import AppList from './AppList.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Your apps • Svelte</title>
</svelte:head>

<AppList
	accounts={data.accounts}
	destination={data.destination}
	owner={null}
	apps={data.apps}
	next={data.next}
	search={data.search}
	tab={data.tab}
	counts={data.counts}
	error={data.error}
/>
