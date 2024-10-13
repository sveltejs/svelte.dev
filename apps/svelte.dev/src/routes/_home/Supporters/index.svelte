<script>
	import { Section } from '@sveltejs/site-kit/components';
	import contributors from './contributors.js';
	import donors from './donors.js';

	// @ts-ignore
	import contributors_img from './contributors.jpg?w=1800&format=webp';
	// @ts-ignore
	import donors_img from './donors.jpg?w=1800&format=webp';
</script>

<!-- <h2>Svelte is here to stay</h2> -->
<p class="intro">
	Backed by <a href="https://vercel.com" target="_blank" rel="noreferrer">Vercel</a> and countless donors,
	developed by full-time and part-time maintainers, Svelte is here to stay.
</p>

<div class="layout">
	<!-- <div class="contributors blurb">
		<h3>contributors</h3>
		<p>
			<a href="https://github.com/sveltejs/svelte/graphs/contributors">Join us on GitHub</a>
		</p>
	</div> -->

	<div class="contributors supporters-grid">
		{#each contributors as contributor, i}
			<a
				class="supporter"
				style="background-position: {(100 * i) / (contributors.length - 1)}% 0"
				style:background-image="url({contributors_img})"
				href="https://github.com/{contributor}"
			>
				{contributor}
			</a>
		{/each}

		{#each donors as donor, i}
			<a
				class="supporter"
				style="background-position: {(100 * i) / (donors.length - 1)}% 0"
				style:background-image="url({donors_img})"
				href="https://opencollective.com/svelte">{donor}</a
			>
		{/each}
	</div>

	<!-- <div class="donors blurb">
		<h3>donors</h3>
		<p><a href="https://opencollective.com/svelte">Support us on OpenCollective</a></p>
	</div> -->

	<!-- <div class="donors supporters-grid">
		{#each donors as donor, i}
			<a
				class="supporter"
				style="background-position: {(100 * i) / (donors.length - 1)}% 0"
				style:background-image="url({donors_img})"
				href="https://opencollective.com/svelte">{donor}</a
			>
		{/each}
	</div> -->
</div>

<style>
	.intro {
		margin: 1em auto 3.2rem auto;
		text-wrap: balance;
		text-align: center;
		max-width: 27em;
		padding: 0 var(--sk-page-padding-side);
	}

	.layout {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin: 0 -1rem;
	}

	.blurb {
		margin: 1em auto;
		max-width: 120rem;
		padding: 0 var(--sk-page-padding-side);
		display: none;

		h3 {
			color: var(--sk-text-2);
		}

		p {
			margin: 0;
		}
	}

	.supporters-grid {
		position: relative;
		display: grid;
		grid-template-columns: repeat(12, minmax(0, 1fr));
		grid-gap: 1rem;
		mask-size: 100%;
		mask-image: radial-gradient(ellipse min(50vw, 100rem) 500%, white, white 70%, transparent);
		width: 100%;
		max-width: 200rem;
		margin: 0 auto;
	}

	.contributors.supporters-grid {
		/* margin: 0 0 2em 0; */
	}

	a[href] {
		/* color: color-mix(in srgb, var(--sk-theme-1) 90%, var(--sk-text-1) 15%); */
	}

	.supporter {
		width: 100%;
		aspect-ratio: 1;
		border-radius: 50%;
		text-indent: -9999px;
		display: inline-block;
		background: no-repeat;
		background-size: auto 102%;
		filter: grayscale(1) opacity(0.7);
	}

	.supporter:hover {
		filter: none;
	}

	@media (min-width: 480px) {
		.supporters-grid {
			grid-template-columns: repeat(16, minmax(0, 1fr));
		}
	}

	@media (min-width: 720px) {
		.supporters-grid {
			grid-template-columns: repeat(24, minmax(0, 1fr));
		}
	}

	@media (min-width: 800px) {
		/* .layout {
			display: grid;
			grid-template-columns: 32rem 2fr;
			grid-row-gap: 1em;
		} */

		h3 {
			margin-top: 0.5rem;
		}

		/* .supporters-grid {
			position: relative;
			display: grid;
			grid-template-columns: repeat(6, minmax(0, 1fr));
			grid-gap: 1em;
		} */
	}

	@media (min-width: 1000px) {
		.supporters-grid {
			grid-template-columns: repeat(32, minmax(0, 1fr));
		}
	}

	@media (min-width: 1600px) {
		.supporters-grid {
			grid-template-columns: repeat(48, minmax(0, 1fr));
		}
	}
</style>
