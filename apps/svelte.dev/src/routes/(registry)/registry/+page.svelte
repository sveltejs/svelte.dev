<script>
	const { data } = $props();

	$inspect(data.registry);
</script>

<svelte:head>
	<title>Registry • Svelte</title>
	<link
		rel="alternate"
		type="application/rss+xml"
		title="Svelte blog"
		href="https://svelte.dev/blog/rss.xml"
	/>

	<meta name="twitter:title" content="Svelte Registry" />
	<meta name="twitter:description" content="Articles about Svelte and UI development" />
	<meta name="Description" content="Articles about Svelte and UI development" />
</svelte:head>

<h1 class="visually-hidden">Registry</h1>

<div class="container">
	<!-- <article class="top" data-pubdate={top.date}>
		<a href="/{top.slug}" title="Read the article »">
			<h2>{top.metadata.title}</h2>
			<p>{@html top.metadata.description}</p>
		</a>

		<!-- <Byline post={top} />
	</article> -->

	<div class="grid">
		<div class="posts">
			{#each data.registry as pkg}
				<article data-pubdate={pkg.updated}>
					<a href="#{pkg.name}" title="Read the article »">
						<h2>{pkg.name}</h2>
						<p>{pkg.description?.replace(/"/g, '').trim()}</p>
					</a>

					<!-- <Byline post={pkg} /> -->
				</article>
			{/each}
		</div>

		<ul class="feed">
			{#each data.tags as tag}
				<li>
					<a href="?tag={tag.tag}" title="Packages under {tag.tag}">
						{tag.short_title}
					</a>
				</li>
			{/each}
		</ul>
	</div>
</div>

<style>
	.container {
		max-width: var(--sk-page-content-width);
		box-sizing: content-box;
		margin: 0 auto;
		text-wrap: balance;
		padding: var(--sk-page-padding-top) var(--sk-page-padding-side);
	}

	h2 {
		display: inline-block;
		color: var(--sk-fg-1);
		font: var(--sk-font-h3);
	}

	article {
		margin: 0 0 4rem 0;

		/* &.top {
			margin: 0 0 2rem 0;
			padding: 0 0 4rem 0;

			h2 {
				font: var(--sk-font-h1);
				color: var(--sk-fg-1);
			}
		} */

		a {
			display: block;
			text-decoration: none;
			color: inherit;

			&:hover h2 {
				text-decoration: underline;
			}
		}

		p {
			font: var(--sk-font-body-small);
			color: var(--sk-fg-3);
			margin: 0 0 0.5em 0;
		}
	}

	.feed {
		display: none;
	}

	@media (min-width: 800px) {
		.grid {
			display: grid;
			grid-template-columns: 3fr 1fr;
			gap: 3em;
		}

		/* .featured,
		.feed {
			padding: 4rem 0;
			position: relative;

			&::before {
				position: absolute;
				top: 0;
				font: var(--sk-font-ui-medium);
				text-transform: uppercase;
				color: var(--sk-fg-3);
			}
		} */

		/* .featured {
			display: block;

			&::before {
				content: 'Featured';
			}

			article {
				&:not(.feature) {
					display: none;
				}

				h2 {
					font: var(--sk-font-h2);
				}
			}
		} */

		.feed {
			display: block;
			margin: 0;
			list-style: none;

			&::before {
				content: 'Categories';
			}

			a {
				display: block;
				font: var(--sk-font-body);
				color: inherit;
			}
		}
	}
</style>
