<script>
	import { roll } from './utils.js';

	let promise = $state(roll());
</script>

<button onclick={() => promise = roll()}>
	roll the dice
</button>

<p>...rolling</p>
