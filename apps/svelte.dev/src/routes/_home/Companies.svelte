<script>
	import { Section } from '@sveltejs/site-kit/components';
</script>

<div class="companies">
	<div class="wing">
		<div class="logos">
			<enhanced:img src="./companies/ikea.svg" alt="Ikea logo" />
			<enhanced:img src="./companies/mullvad.svg" alt="Mullvad logo" />
			<enhanced:img src="./companies/stackoverflow.svg" alt="Mullvad logo" />
			<enhanced:img src="./companies/square.svg" alt="Mullvad logo" />
			<enhanced:img src="./companies/apple-lockup.svg" alt="Apple logo" />
		</div>
	</div>
	<h2>used by companies you've heard of</h2>
	<div class="wing">
		<div class="logos">
			<enhanced:img src="./companies/spotify.svg" alt="Spotify logo" />
			<enhanced:img src="./companies/yelp.svg" alt="New York Times logo" />
			<enhanced:img src="./companies/nyt.svg" alt="New York Times logo" />
			<enhanced:img src="./companies/logitech.svg" alt="Logitech logo" />
			<enhanced:img src="./companies/decathlon.svg" alt="Decathlon logo" />
			<enhanced:img src="./companies/1password.svg" alt="1password logo" />
		</div>
	</div>
</div>

<style>
	.companies {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		margin: 6rem 0;
	}

	h2 {
		max-width: 12em;
		text-align: center;
		margin: 0 auto;
	}

	.wing {
		position: relative;
		height: 4rem;
	}

	.logos {
		position: absolute;
		display: flex;
		height: 100%;
		align-items: center;
		top: 0;
		gap: 2rem;

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
</style>
