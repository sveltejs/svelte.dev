<script>
	import { Section } from '@sveltejs/site-kit/components';
</script>

<Section --max-width="200rem">
	<enhanced:img
		src="./summit.png"
		alt="Photos by Marcel Cutts from the 2022 Svelte Summit in Stockholm"
	/>

	<h2>join our friendly community</h2>
	<p>
		Our sister organisation, <a href="https://www.sveltesociety.dev/">Svelte Society</a>, organises
		events around the globe.
	</p>
	<p>Find your chapter and join us in <a href="/chat">our Discord server</a>.</p>
</Section>

<style>
	.community {
		padding: 0 var(--sk-page-padding-side);
		max-width: 200rem;
		box-sizing: border-box;
		margin: 0 auto 6rem 0;
		text-align: center;
		margin: 0 0 6rem 0;
	}

	img {
		width: 100%;
		height: auto;
	}

	h2,
	p {
		text-align: center;
	}
</style>
