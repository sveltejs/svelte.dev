<script>
	import FlakyCounter from "./FlakyCounter.svelte";
	import StableCounter from "./StableCounter.svelte";
</script>

<StableCounter />

<svelte:boundary onerror={error => console.log(error)}>
	<FlakyCounter />

	{#snippet failed(error, reset)}
		<p>{error.message}</p>
		<button onclick={reset}>Try again</button>
	{/snippet}
</svelte:boundary>
