<div class="companies">
	<div class="wing">
		<div class="logos">
			<enhanced:img src="./companies/ikea.svg" alt="Ikea logo" />
			<enhanced:img src="./companies/mullvad.svg" alt="Mullvad logo" />
			<enhanced:img src="./companies/stack-overflow.svg" alt="Mullvad logo" />
			<enhanced:img src="./companies/yelp.svg" alt="New York Times logo" />
			<enhanced:img src="./companies/square.svg" alt="Mullvad logo" />
			<enhanced:img src="./companies/apple.svg" alt="Apple logo" />
		</div>
	</div>
	<h2>used by companies you’ve heard of</h2>
	<div class="wing">
		<div class="logos">
			<enhanced:img src="./companies/spotify.svg" alt="Spotify logo" />
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
		gap: 1rem;
		align-items: center;
		margin: 15rem 0 5rem 0;
		mask-size: 100%;
		mask-image: radial-gradient(ellipse 110rem 500%, white, white 70%, transparent);
	}

	h2 {
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
			width: 12em;
		}

		.logos {
			position: absolute;
		}
	}
</style>
