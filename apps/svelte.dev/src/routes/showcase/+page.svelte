<script>
	const showcaseItems = [
		{
			title: 'Apple App Store',
			image: '/showcase/apps.apple.png',
			link: 'https://apps.apple.com/'
		},
		{
			title: 'Apple Music',
			image: '/showcase/music.apple.png',
			link: 'https://music.apple.com/'
		},
		{
			title: 'Brave',
			image: '/showcase/brave.png',
			link: 'https://brave.com/'
		},
		{
			title: 'Bugatti',
			image: '/showcase/bugatti.png',
			link: 'https://www.bugatti.com/'
		},
		{
			title: 'IKEA',
			image: '/showcase/ikea.png',
			link: 'https://www.ikea.com/'
		},
		{
			title: 'Logitech',
			image: '/showcase/logitech.png',
			link: 'https://www.logitech.com/'
		},
		{
			title: 'The New York Times',
			image: '/showcase/nytimes.png',
			link: 'https://www.nytimes.com/'
		},
		{
			title: 'Square',
			image: '/showcase/squareup.png',
			link: 'https://squareup.com/'
		},
		{
			title: 'Yahoo Finance',
			image: '/showcase/finance.yahoo.png',
			link: 'https://finance.yahoo.com/'
		},
		{
			title: 'Yelp',
			image: '/showcase/top100.yelp.png',
			link: 'https://top100.yelp.com/'
		}
	];
</script>

<svelte:head>
	<title>Showcase • Svelte</title>

	<meta name="twitter:title" content="Showcase • Svelte" />
	<meta name="twitter:description" content="Explore projects built with Svelte and SvelteKit." />
	<meta name="Description" content="Explore projects built with Svelte and SvelteKit." />
</svelte:head>
<div class="page content">
	<header>
		<h1>Showcase</h1>
		<p>Explore projects built with Svelte and SvelteKit.</p>
	</header>

	<div class="showcase-grid">
		{#each showcaseItems as item, index (index)}
			<a href={item.link} class="showcase-card" target="_blank" rel="noopener noreferrer">
				<div class="card-image">
					<img src={item.image} alt={item.title} loading="lazy" />
				</div>
				<div class="card-content">
					<h3 class="card-title">
						<span> {item.title}</span>
						<span data-icon="arrow-up-right"></span>
					</h3>
				</div>
			</a>
		{/each}
	</div>
</div>

<style>
	.page {
		padding: var(--sk-page-padding-top) var(--sk-page-padding-side) var(--sk-page-padding-bottom);
		min-width: 0 !important;
		max-width: 140rem;
		margin: 0 auto;
		text-wrap: balance;
	}

	header {
		margin: 0 0 4rem 0;
	}

	[data-icon] {
		position: relative;
		display: inline-flex;
		width: 1.8rem;
		height: 1.8rem;
		background: currentColor;
		mask: no-repeat 50% 50%;
		mask-size: contain;
		transition: all 300ms ease;
		&[data-icon='arrow-up-right'] {
			mask-image: url(icons/arrow-up-right);
		}
	}

	.showcase-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 3rem;
		width: 100%;

		@media screen and (max-width: 1200px) {
			grid-template-columns: repeat(3, 1fr);
			gap: 2.5rem;
		}

		@media (max-width: 768px) {
			grid-template-columns: repeat(2, 1fr);
			gap: 2.25rem;
		}

		@media (max-width: 480px) {
			grid-template-columns: 1fr;
			gap: 1rem;
		}
	}

	.showcase-card {
		display: flex;
		flex-direction: column;
		overflow: hidden;
		transition: all 0.3s ease;
		background-color: var(--sk-bg-1);
		color: inherit;
		height: 100%;
		text-decoration: none;
		border-radius: var(--sk-border-radius);
		min-height: 16rem;

		:root:not(.light) & {
			@media (prefers-color-scheme: dark) {
				background-color: var(--sk-bg-3);
			}
		}

		:root.light & {
			filter: drop-shadow(0rem 0.6rem 0.6rem rgb(0 0 0 / 0.125));
			background-color: #fbfbfb;
		}

		&:hover .card-title {
			color: #0087e8;
		}

		&:hover [data-icon] {
			transform: translate(0.1rem, -0.2rem);
		}
	}

	.card-image {
		position: relative;
		width: 100%;
		padding-top: 62.5%;
		overflow: hidden;
		background: var(--sk-back-2);
	}

	.card-image img {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.card-content {
		padding: 1.25rem;
		flex: 1;
		display: flex;
		align-items: center;
	}

	.card-title {
		font: var(--sk-font-ui-medium);
		display: flex;
		align-items: center;
		gap: 0.2rem;
	}
</style>
