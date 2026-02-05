<script lang="ts">
	import Byline from './Byline.svelte';

	let { data } = $props();

	// svelte-ignore state_referenced_locally
	const whats_new = data.posts.filter((post) => post.metadata.title.startsWith('What’s new'));

	// svelte-ignore state_referenced_locally
	const top = data.posts[0];
</script>

<svelte:head>
	<title>Blog • Svelte</title>
	<link
		rel="alternate"
		type="application/rss+xml"
		title="Svelte blog"
		href="https://svelte.dev/blog/rss.xml"
	/>

	<meta name="twitter:title" content="Svelte blog" />
	<meta name="twitter:description" content="Articles about Svelte and UI development" />
	<meta name="description" content="Articles about Svelte and UI development" />
</svelte:head>

<h1 class="visually-hidden">Blog</h1>

<div class="container">
	<article class="top" data-pubdate={top.date}>
		<a href="/{top.slug}" title="Read the article »">
			<h2>{top.metadata.title}</h2>
			<p>{@html top.metadata.description}</p>
		</a>

		<Byline post={top} />
	</article>

	<div class="grid">
		<div class="featured posts">
			{#each data.posts.slice(1) as post}
				<article
					class:feature={!post.metadata.title.startsWith('What’s new')}
					data-pubdate={post.date}
				>
					<a href="/{post.slug}" title="Read the article »">
						<h2>{post.metadata.title}</h2>
						<p>{@html post.metadata.description}</p>
					</a>

					<Byline {post} />
				</article>
			{/each}
		</div>

		<ul class="feed">
			{#each whats_new as post}
				<li>
					<a href="/{post.slug}" title="Read the article »">
						{post.metadata.title.replace('What’s new in Svelte: ', '')}
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

		&.top {
			margin: 0 0 2rem 0;
			padding: 0 0 4rem 0;

			h2 {
				font: var(--sk-font-h1);
				color: var(--sk-fg-1);
			}
		}

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

		.featured,
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
		}

		.featured {
			display: block;

			&::before {
				content: 'Featured posts';
			}

			article {
				&:not(.feature) {
					display: none;
				}

				h2 {
					font: var(--sk-font-h2);
				}
			}
		}

		.feed {
			display: block;
			margin: 0;
			list-style: none;

			&::before {
				content: 'Monthly updates';
			}

			a {
				display: block;
				font: var(--sk-font-body);
				color: inherit;
			}
		}
	}
</style>
