<script>
	import { counter } from './shared.js';
</script>

<button onclick={() => counter.count += 1}>
	clicks: {counter.count}
</button>
