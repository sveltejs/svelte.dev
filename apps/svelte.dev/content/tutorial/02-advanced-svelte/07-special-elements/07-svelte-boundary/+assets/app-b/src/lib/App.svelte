<script>
	import FlakyComponent from './FlakyComponent.svelte';
</script>


<svelte:boundary onerror={(e) => console.error(e)}>
	<FlakyComponent />

	{#snippet failed(error, reset)}
		<p>Oops! {error.message}</p>
		<button onclick={reset}>Reset</button>
	{/snippet}
</svelte:boundary>
