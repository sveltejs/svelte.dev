<script lang="ts">
	import { onMount, type Component } from 'svelte';

	let {
		this: importer,
		...rest
	}: {
		this: () => Promise<Component>;
	} = $props();

	let constructor: Component;

	onMount(async () => {
		constructor = await importer();
	});
</script>

<svelte:component this={constructor} {...rest} />
