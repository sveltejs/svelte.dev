<div class="companies">
	<div class="wing">
		<div class="logos">
			<enhanced:img src="./companies/mullvad.svg" loading="lazy" alt="Mullvad logo" />
			<enhanced:img src="./companies/stack-overflow.svg" loading="lazy" alt="Stack Overflow logo" />
			<enhanced:img src="./companies/yelp.svg" loading="lazy" alt="Yelp logo" />
			<enhanced:img src="./companies/square.svg" loading="lazy" alt="Square logo" />
			<enhanced:img src="./companies/apple.svg" loading="lazy" alt="Apple logo" />
		</div>
	</div>
	<h2>used by companies you’ve heard of</h2>
	<div class="wing">
		<div class="logos">
			<enhanced:img src="./companies/spotify.svg" loading="lazy" alt="Spotify logo" />
			<enhanced:img src="./companies/nyt.svg" loading="lazy" alt="New York Times logo" />
			<enhanced:img src="./companies/ikea.svg" loading="lazy" alt="Ikea logo" />
			<enhanced:img src="./companies/decathlon.svg" loading="lazy" alt="Decathlon logo" />
			<enhanced:img src="./companies/1password.svg" loading="lazy" alt="1password logo" />
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

		img {
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
