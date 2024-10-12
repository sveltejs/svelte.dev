<script>
	import Logotype from './svelte-kit-logotype.svg.svelte';
</script>

<section class="hero">
	<div class="hero-contents">
		<div class="hero-text">
			<h3 class="tagline">Go full-stack with</h3>
			<div class="logotype" role="img" aria-label="SvelteKit">
				<Logotype />
			</div>
			<p>
				Powered by Svelte and
				<a target="_blank" rel="noreferrer" href="https://vitejs.dev">Vite</a>, SvelteKit gives you
				the tools to build web applications in streamlined fashion. No more wasted days figuring out
				bundler configuration, routing, SSR, CSP, TypeScript, deployment settings and all the other
				boring stuff.
			</p>
		</div>

		<div class="hero-image-wrapper">
			<!-- svelte-ignore element_invalid_self_closing_tag -->
			<enhanced:img
				src="./svelte-kit-machine.webp?w=1440;1080;768;640"
				sizes="(min-width: 768px) min(100vw, 108rem), 64rem"
				class="hero-image"
				alt="SvelteKit illustration"
			/>
		</div>
	</div>
</section>

<style>
	.hero {
		max-width: 100vw;
		position: relative;
		padding: 8rem var(--sk-page-padding-side);
		margin-bottom: 2rem;
	}

	.hero-contents {
		position: relative;
		max-width: 48rem;
		margin: 0 auto;
		padding-bottom: 10rem;
	}

	.hero-text {
		text-align: center;
	}

	.hero .tagline {
		font: var(--sk-font-h2);
		color: var(--sk-text-2);
		margin-bottom: 2rem;
	}

	.logotype :global(svg) {
		position: relative;
		width: 100%;
		max-width: 400px;
		margin: 0 0 1rem 0;
	}

	.hero-image-wrapper {
		--size: 64rem;
		position: absolute;
		left: calc(50% - 0.53 * var(--size));
		bottom: -30rem;
		pointer-events: none;
	}

	.hero-image {
		width: var(--size);
		height: auto;
		aspect-ratio: 4 / 3;
		object-fit: cover;
	}

	@media (min-width: 768px) {
		.hero {
			padding: calc(10rem + var(--sk-nav-height)) var(--sk-page-padding-side) 16rem;
		}
		.hero-contents {
			max-width: calc(120rem - 2 * var(--sk-page-padding-side));
			padding-bottom: 0rem;
		}

		.hero-text {
			text-align: left;
			max-width: 40%;
		}

		.hero-image-wrapper {
			--size: min(100vw, 108rem);
			left: auto;
			right: -20rem;
			bottom: calc(-5rem - 0.38 * var(--size));
		}
	}

	@media (prefers-color-scheme: dark) {
		.hero {
			background: hsl(210, 7%, 20%);
			background: var(--dark-gradient);
		}

		.hero-text :global(svg) {
			mix-blend-mode: screen;
		}

		:global(html.light) .hero {
			background: var(--gradient);
		}

		:global(html.light) .hero-text :global(svg) {
			mix-blend-mode: initial;
		}
	}

	:global(html.dark) .hero {
		background: hsl(210, 7%, 20%);
		background: var(--dark-gradient);
	}

	:global(html.dark) .hero-text :global(svg) {
		mix-blend-mode: screen;
	}
</style>
