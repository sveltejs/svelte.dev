<script>
	import FlakyComponent from './FlakyComponent.svelte';
</script>


<svelte:boundary onerror={error => console.log(error)}>
	<FlakyComponent />

	{#snippet failed(error, reset)}
		<p>Component crashed: {error.message}</p>
		<button onclick={reset}>Reset</button>
	{/snippet}
</svelte:boundary>
