<script>
	import { Section } from '@sveltejs/site-kit/components';
</script>

<div class="outer">
	<div class="copy">
		<p>
			Svelte is a UI framework that uses a compiler to let you write breathtakingly concise
			components that do minimal work in the browser, using languages you already know — HTML, CSS
			and JavaScript. <strong>It's a love letter to web development.</strong>
		</p>

		<p>
			But don't take our word for it. Developers consistently rank Svelte as the framework they're
			<a
				target="_blank"
				rel="noreferrer"
				href="https://survey.stackoverflow.co/2023/#section-admired-and-desired-web-frameworks-and-technologies"
			>
				most
			</a>
			<a
				target="_blank"
				rel="noreferrer"
				href="https://tsh.io/state-of-frontend/#which-of-the-following-frameworks-would-you-like-to-learn-in-the-future"
			>
				excited
			</a>
			<a
				target="_blank"
				rel="noreferrer"
				href="https://2023.stateofjs.com/en-US/libraries/front-end-frameworks/"
			>
				about
			</a>

			<a
				target="_blank"
				rel="noreferrer"
				href="https://twitter.com/Rich_Harris/status/1589675637195042817"
			>
				using</a
			>.
		</p>
	</div>

	<!-- svelte-ignore a11y_consider_explicit_label (the <enhanced:img> alt takes care of it)-->
	<div class="container">
		<a href="https://survey.stackoverflow.co/2024/technology#2-web-frameworks-and-technologies">
			<enhanced:img alt="Stack Overflow 2024 Developer Survey" src="./stack-overflow.png"
			></enhanced:img>
		</a>

		<a href="https://2023.stateofjs.com/en-US/libraries/front-end-frameworks/">
			<enhanced:img alt="State of JavaScript 2023" src="./state-of-js-chart.png"></enhanced:img>
		</a>

		<a href="https://x.com/flaviocopes/status/1730895911864189299">
			<enhanced:img alt="Tweet from @flaviocopes" src="./flavio-light.png"></enhanced:img>
		</a>
	</div>
</div>

<!-- <Section>
	<div class="container">
		<enhanced:img alt="State of JavaScript 2023 screenshot" src="./state-of-js-chart.png"
		></enhanced:img>
	</div>
</Section> -->

<style>
	.outer {
		position: relative;
		display: grid;
		max-width: 120rem;
		margin: 4rem auto;
		padding: 0 var(--sk-page-padding-side);
		gap: 4rem;

		@media (min-width: 960px) {
			margin: 4em auto;
			grid-template-columns: 2fr 1fr;
			/* align-items: center; */
			/* gap: 2rem; */

			.copy {
				/* order: 2; */
				text-wrap: balance;
			}
		}
	}

	.container {
		position: relative;
		width: 100%;
		aspect-ratio: 16 / 10;

		a {
			position: absolute;
			display: block;
			width: 100%;
			top: 0;
			filter: drop-shadow(0.2rem 0.4rem 1rem rgb(0 0 0 / 0.1));
			overflow: hidden;

			&:nth-child(1) {
				top: 0%;
				left: -2%;
				rotate: -1deg;
			}

			&:nth-child(2) {
				width: 80%;
				left: 22%;
				top: 32%;
				rotate: -0.7deg;
			}

			&:nth-child(3) {
				top: 51%;
				left: 5%;
				width: 50%;
				rotate: 1.5deg;
			}
		}

		img {
			width: 100%;
			height: auto;
			border-radius: var(--sk-border-radius);

			object-fit: contain;
			/* mask-image: linear-gradient(to right, transparent, white),
				linear-gradient(to top, transparent, white); */
			/* mask-image: radial-gradient(ellipse 200% 400% at 100% 50%, white, white 20%, transparent);
			mask-size: 100%; */
			/* left: -10rem; */
			border-radius: var(--sk-border-radius);

			/* rotate: -2deg; */
		}
	}
</style>
