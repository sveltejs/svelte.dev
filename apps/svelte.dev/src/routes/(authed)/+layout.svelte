<script lang="ts">
	import { on_storage } from './auth';

	let { children } = $props();
</script>

<svelte:window onstorage={on_storage} />

{@render children?.()}
