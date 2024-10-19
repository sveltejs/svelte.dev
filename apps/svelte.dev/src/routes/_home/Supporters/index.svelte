<script>
	import contributors from './contributors.js';
	import donors from './donors.js';

	// @ts-expect-error
	import contributors_img from './contributors.jpg?format=webp';
	// @ts-expect-error
	import donors_img from './donors.jpg?format=webp';
</script>

<p class="intro">
	Backed by <a href="https://vercel.com" target="_blank" rel="noreferrer">Vercel</a> and countless donors,
	developed by full-time and part-time maintainers, Svelte is here to stay.
</p>

<div class="wrapper">
	<div class="layout">
		<div class="supporters">
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
	</div>
</div>

<style>
	.wrapper {
		width: 100%;
		overflow: hidden;
	}

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

	.supporters {
		position: relative;
		display: grid;
		grid-template-columns: repeat(12, minmax(0, 1fr));
		grid-gap: 1rem;
		mask-size: 100%;
		mask-image: radial-gradient(ellipse min(50vw, 100rem) 500%, white, white 70%, transparent);
		width: 100%;
		max-width: 200rem;
		margin: 0 auto;

		@media (min-width: 480px) {
			grid-template-columns: repeat(16, minmax(0, 1fr));
		}

		@media (min-width: 720px) {
			grid-template-columns: repeat(24, minmax(0, 1fr));
		}

		@media (min-width: 1000px) {
			grid-template-columns: repeat(32, minmax(0, 1fr));
		}

		@media (min-width: 1600px) {
			grid-template-columns: repeat(48, minmax(0, 1fr));
		}
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
		-webkit-transform: translate3d(0, 0, 0);
	}

	.supporter:hover {
		filter: none;
	}
</style>
