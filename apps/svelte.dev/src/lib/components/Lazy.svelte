<script lang="ts">
	import { onMount, type Component } from 'svelte';

	let {
		this: importer,
		...rest
	}: {
		this: () => Promise<Component>;
	} = $props();

	let Comp = $state() as Component;

	onMount(async () => {
		Comp = await importer();
	});
</script>

<Comp {...rest} />
