<script>
	import Card from './Card.svelte';
</script>

<main>
	<Card>
		<span>Patrick BATEMAN</span>
		<span>Vice President</span>

		{#snippet telephone()}
			<span>212 555 6342</span>
		{/snippet}

		{#snippet company()}
			<span>
				Pierce &amp; Pierce
				<small>Mergers and Aquisitions</small>
			</span>
		{/snippet}

		{#snippet address()}
			<span>358 Exchange Place, New York, N.Y. 10099 fax 212 555 6390 telex 10 4534</span>
		{/snippet}
	</Card>
</main>

<style>
	main {
		display: grid;
		place-items: center;
		height: 100%;
		background: url(./wood.svg);
	}
</style>
