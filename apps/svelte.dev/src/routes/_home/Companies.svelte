<div class="companies">
	<div class="wing">
		<div class="logos">
			<enhanced:img class="logo" src="./companies/mullvad.svg" alt="Mullvad logo" />
			<enhanced:img class="logo" src="./companies/stack-overflow.svg" alt="Stack Overflow logo" />
			<enhanced:img class="logo" src="./companies/yelp.svg" alt="Yelp logo" />
			<enhanced:img class="logo" src="./companies/square.svg" alt="Square logo" />
			<enhanced:img class="logo" src="./companies/apple.svg" alt="Apple logo" />
		</div>
	</div>
	<h2>used by companies you’ve heard of</h2>
	<div class="wing">
		<div class="logos">
			<enhanced:img class="logo" src="./companies/spotify.svg" alt="Spotify logo" />
			<enhanced:img class="logo" src="./companies/nyt.svg" alt="New York Times logo" />
			<enhanced:img class="logo" src="./companies/ikea.svg" alt="Ikea logo" />
			<enhanced:img class="logo" src="./companies/decathlon.svg" alt="Decathlon logo" />
			<enhanced:img class="logo" src="./companies/1password.svg" alt="1password logo" />
		</div>
	</div>
</div>

<style>
	.companies {
		display: grid;
		gap: 1rem;
		align-items: center;
		justify-content: center;
		margin: 15rem 0 5rem 0;
		mask-size: 100%;
		mask-image: radial-gradient(ellipse 110rem 500%, white, white 70%, transparent);
		overflow: hidden;
	}

	h2 {
		width: 10em;
		text-align: center;
		justify-self: center;
		z-index: 2;
		filter: drop-shadow(0 0 1rem var(--sk-bg-1)) drop-shadow(0 0 1rem var(--sk-bg-1));
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

		.logo {
			height: 100%;
			width: auto;
		}
	}

	@media (min-width: 600px) {
		.companies {
			grid-template-columns: 1fr auto 1fr;
			align-items: center;
		}

		h2 {
			position: relative;
		}

		.wing:first-child .logos {
			right: 0;
		}

		.wing:last-child .logos {
			left: 0;
		}

		.logos {
			position: absolute;
		}
	}
</style>
