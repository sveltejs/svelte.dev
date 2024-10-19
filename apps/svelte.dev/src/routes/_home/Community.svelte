<script>
	import { Section } from '@sveltejs/site-kit/components';
</script>

<Section --max-width="200rem">
	<h2>join our friendly community</h2>
	<p>
		Our sister organisation, <a href="https://www.sveltesociety.dev/">Svelte Society</a>, organises
		events around the globe.
	</p>
	<p>Find your chapter and join us in <a href="/chat">our Discord server</a>.</p>

	<figure>
		<enhanced:img
			src="./summit.png?w=800;1200;2000;2800;4400"
			alt="Photos by Marcel Cutts from the 2022 Svelte Summit in Stockholm"
		/>
		<figcaption>Photos by <a href="https://x.com/marcelcutts">Marcel Cutts</a></figcaption>
	</figure>
</Section>

<style>
	figure {
		position: relative;
	}

	figcaption {
		position: relative;
		top: max(-2vw, calc(-0.02 * (120rem + 2 * var(--sk-page-padding-side))));
		font: var(--sk-font-body-small);
		margin: 0 auto;
		padding: 0 var(--sk-page-padding-side);
		color: var(--sk-text-4);
		text-align: center;

		a {
			text-wrap: nowrap;
			color: inherit;
			text-decoration: underline;
		}
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
