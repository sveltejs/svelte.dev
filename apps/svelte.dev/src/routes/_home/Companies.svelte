<script>
	import { Section } from '@sveltejs/site-kit/components';
</script>

<div class="companies">
	<div class="wing">
		<div class="logos">
			<enhanced:img src="./companies/light/ikea.svg" alt="Ikea logo" />
			<enhanced:img src="./companies/light/mullvad.svg" alt="Mullvad logo" />
			<enhanced:img src="./companies/light/stack-overflow.svg" alt="Mullvad logo" />
			<enhanced:img src="./companies/light/yelp.svg" alt="New York Times logo" />
			<enhanced:img src="./companies/light/square.svg" alt="Mullvad logo" />
			<enhanced:img src="./companies/light/apple.svg" alt="Apple logo" />
		</div>
	</div>
	<h2>used by companies you've heard of</h2>
	<div class="wing">
		<div class="logos">
			<enhanced:img src="./companies/light/spotify.svg" alt="Spotify logo" />
			<enhanced:img src="./companies/light/nyt.svg" alt="New York Times logo" />
			<enhanced:img src="./companies/light/logitech.svg" alt="Logitech logo" />
			<enhanced:img src="./companies/light/decathlon.svg" alt="Decathlon logo" />
			<enhanced:img src="./companies/light/1password.svg" alt="1password logo" />
		</div>
	</div>
</div>

<style>
	.companies {
		--h2-width: 12em;
		display: grid;
		gap: 1rem;
		align-items: center;
		margin: 15rem 0 5rem 0;
		mask-size: 100%;
		mask-image: radial-gradient(ellipse 110rem 500%, white, white 70%, transparent);
	}

	h2 {
		/* width: var(--h2-width); */
		width: 100%;
		text-align: center;
		margin: 0 auto;
		position: absolute;
		z-index: 2;
		filter: drop-shadow(0 0 1rem var(--sk-back-1)) drop-shadow(0 0 1rem var(--sk-back-1));
		padding: 0 var(--sk-page-padding-side);
	}

	.wing {
		position: relative;
		height: 4rem;
	}

	.logos {
		/* position: absolute; */
		display: flex;
		height: 100%;
		align-items: center;
		top: 0;
		gap: 4rem;
		opacity: 0.5;

		.wing:first-child & {
			right: 0;
		}

		.wing:last-child & {
			left: 0;
		}

		img {
			height: 100%;
			width: auto;
		}
	}

	@media (min-width: 800px) {
		.companies {
			grid-template-columns: 1fr auto 1fr;
			align-items: center;
		}

		h2 {
			position: relative;
			width: var(--h2-width);
		}

		.logos {
			position: absolute;
		}
	}
</style>
