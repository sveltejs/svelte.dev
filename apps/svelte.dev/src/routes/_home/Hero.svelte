<script>
	import { Icon } from '@sveltejs/site-kit/components';
	// @ts-expect-error
	import MachineDesktop from './svelte-machine-desktop.png?w=1200;2000;2800;4400&format=avif;webp;png;&as=picture';
	// @ts-expect-error
	import MachineMobile from './svelte-machine-mobile.png?w=960&format=avif;webp;png;&as=picture';
</script>

<div class="hero">
	<div class="hero-content">
		<h1>web development for the rest of us</h1>
		<a href="/docs" class="cta">get started <Icon name="arrow-right" /></a>
	</div>

	<picture class="machine">
		<source
			srcset={MachineDesktop.sources.avif}
			width="3795"
			height="993"
			type="image/avif"
			media="(min-width: 800px)"
		/>
		<source
			srcset={MachineDesktop.sources.webp}
			width="3795"
			height="993"
			type="image/webp"
			media="(min-width: 800px)"
		/>
		<source
			srcset={MachineDesktop.sources.png}
			width="3795"
			height="993"
			type="image/png"
			media="(min-width: 800px)"
		/>
		<source srcset={MachineMobile.sources.avif} width="2208" height="936" type="image/avif" />
		<source srcset={MachineMobile.sources.webp} width="2208" height="936" type="image/webp" />
		<source srcset={MachineMobile.sources.png} width="2208" height="936" type="image/png" />
		<img
			alt="The Svelte compiler packaging up your component code"
			src={MachineMobile.img.src}
			fetchpriority="high"
		/>
	</picture>
</div>

<style>
	.hero {
		position: relative;
		padding: 6rem 0 34vw 0;
		margin-bottom: 3rem;
		height: calc(22rem + 40vw);

		&::before {
			content: '';
			position: absolute;
			width: 100%;
			height: 200%;
			left: 0;
			top: -8rem; /* prevent cutoff on overscroll */
			background: linear-gradient(to bottom, transparent, var(--sk-bg-1)),
				radial-gradient(circle at 40% 30%, rgb(235, 243, 249), rgb(214, 222, 228));
		}

		:root:not(.light) &::before {
			@media (prefers-color-scheme: dark) {
				background: linear-gradient(to bottom, transparent, var(--sk-bg-1)),
					radial-gradient(
						64.14% 72.25% at 47.58% 31.75%,
						hsl(209deg 6% 47% / 52%) 0%,
						hsla(0, 0%, 100%, 0) 100%
					),
					linear-gradient(
						92.4deg,
						hsl(210, 7%, 16%) 14.67%,
						hsl(0deg 0% 0% / 48%) 54.37%,
						hsla(207, 22%, 13%, 0.62) 92.49%
					),
					linear-gradient(0deg, hsl(204, 38%, 20%), hsl(204, 10%, 90%));
			}
		}
		:root.dark &::before {
			background: linear-gradient(to bottom, transparent, var(--sk-bg-1)),
				radial-gradient(
					64.14% 72.25% at 47.58% 31.75%,
					hsl(209deg 6% 47% / 52%) 0%,
					hsla(0, 0%, 100%, 0) 100%
				),
				linear-gradient(
					92.4deg,
					hsl(210, 7%, 16%) 14.67%,
					hsl(0deg 0% 0% / 48%) 54.37%,
					hsla(207, 22%, 13%, 0.62) 92.49%
				),
				linear-gradient(0deg, hsl(204, 38%, 20%), hsl(204, 10%, 90%));
		}
	}

	.hero-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		margin-bottom: 4rem;
		text-align: center;
	}

	h1 {
		max-width: 9em;
		margin-bottom: 0.5em;
	}

	.machine img {
		position: absolute;
		pointer-events: none;
		width: 100%;
		height: auto;
	}

	.cta {
		font: var(--sk-font-ui-medium);
		font-size: 2rem;
		color: var(--sk-fg-accent);
		text-transform: uppercase;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	@media (min-width: 800px) {
		.hero-content {
			--width: clamp(60rem, 50vw, 80rem);
			align-items: start;
			position: absolute;
			width: var(--width);
			left: calc(0.5 * (100% - min(100vw, 120rem)) + var(--sk-page-padding-side));
			top: calc(8vw - 2rem);
			text-align: left;
		}

		.hero {
			height: calc(20rem + 20vw);
			padding: 14rem 0 0 0;
		}
	}

	@media (min-width: 1400px) {
		.hero {
			height: calc(20rem + 20vw);
			padding: 10rem 0 0 0;
		}
	}
</style>
