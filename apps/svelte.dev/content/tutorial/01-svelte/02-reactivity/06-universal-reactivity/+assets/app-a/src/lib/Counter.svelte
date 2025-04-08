<!-- disable legacy mode for this tutorial -->
<svelte:options runes={true} />

<script>
	import { counter } from './shared.js';
</script>

<button onclick={() => counter.count += 1}>
	clicks: {counter.count}
</button>
