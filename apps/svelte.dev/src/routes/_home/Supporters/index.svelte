<script>
	import { Section } from '@sveltejs/site-kit/components';
	import contributors from './contributors.js';
	import donors from './donors.js';

	// @ts-ignore
	import contributors_img from './contributors.jpg?w=1200&format=webp';
	// @ts-ignore
	import donors_img from './donors.jpg?w=1200&format=webp';
</script>

<Section --background="var(--sk-back-2">
	<h2>Svelte is here to stay</h2>
	<p class="intro">
		Backed by <a href="https://vercel.com" target="_blank" rel="noreferrer">Vercel</a> and countless
		donors, developed by full-time and part-time maintainers, surrounded by a welcoming community.
	</p>

	<div class="layout">
		<div class="contributors blurb">
			<h3>contributors</h3>
			<p>
				<a href="https://github.com/sveltejs/svelte/graphs/contributors">Join us on GitHub</a>
			</p>
		</div>

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
		</div>

		<div class="donors blurb">
			<h3>donors</h3>
			<p><a href="https://opencollective.com/svelte">Support us on OpenCollective</a></p>
		</div>

		<div class="donors supporters-grid">
			{#each donors as donor, i}
				<a
					class="supporter"
					style="background-position: {(100 * i) / (donors.length - 1)}% 0"
					style:background-image="url({donors_img})"
					href="https://opencollective.com/svelte">{donor}</a
				>
			{/each}
		</div>
	</div>
</Section>

<style>
	h3 {
		color: var(--sk-text-2);
		font-size: var(--sk-text-l);
	}

	.intro {
		max-width: 28em; /* text balancing */
		margin: 1em 0 3.2rem 0;
	}

	.supporters-grid {
		position: relative;
		display: grid;
		grid-template-columns: repeat(6, minmax(0, 1fr));
		grid-gap: 1em;
	}

	.contributors.supporters-grid {
		margin: 0 0 2em 0;
	}

	a[href] {
		color: color-mix(in srgb, var(--sk-theme-1) 90%, var(--sk-text-1) 15%);
	}

	.supporter {
		width: 100%;
		aspect-ratio: 1;
		border-radius: 50%;
		text-indent: -9999px;
		display: inline-block;
		background: no-repeat;
		background-size: auto 102%;
		filter: grayscale(1) opacity(0.7) drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.3));
	}

	.supporter:hover {
		filter: drop-shadow(1px 2px 8px rgba(0, 0, 0, 0.3));
	}

	@media (min-width: 480px) {
		.supporters-grid {
			grid-template-columns: repeat(8, minmax(0, 1fr));
		}
	}

	@media (min-width: 720px) {
		.supporters-grid {
			grid-template-columns: repeat(12, minmax(0, 1fr));
		}
	}

	@media (min-width: 800px) {
		.layout {
			display: grid;
			grid-template-columns: 32rem 2fr;
			grid-row-gap: 1em;
		}

		h3 {
			margin-top: 0.5rem;
		}

		.supporters-grid {
			position: relative;
			display: grid;
			grid-template-columns: repeat(6, minmax(0, 1fr));
			grid-gap: 1em;
		}
	}

	@media (min-width: 880px) {
		.supporters-grid {
			grid-template-columns: repeat(8, minmax(0, 1fr));
		}
	}

	@media (min-width: 1100px) {
		.supporters-grid {
			grid-template-columns: repeat(12, minmax(0, 1fr));
		}
	}

	@media (min-width: 1200px) {
		.intro {
			max-width: 600px;
		}
	}
</style>
